import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, switchMap, tap, firstValueFrom } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { StorageService } from '../../services/storage.service';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FontAwesomeModule,
    ProductCardComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private storageService = inject(StorageService);
  private fb = inject(FormBuilder);
  
  // Font Awesome icons
  faPlus = faPlus;
  faTimes = faTimes;
  faUpload = faUpload;

  currentUser$!: Observable<User | null>;
  userProducts$!: Observable<Product[]>;
  
  profileForm!: FormGroup;
  isEditingProfile = false;
  isLoading = true;
  
  // For product editing
  editingProduct: Product | null = null;
  productForm!: FormGroup;
  
  // For image uploads
  selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  submitting: boolean = false;

  ngOnInit(): void {
    this.initProfileForm();
    
    this.currentUser$ = this.authService.currentUser$.pipe(
      tap(user => {
        if (user) {
          this.profileForm.patchValue({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL || ''
          });
          
          // Load user's products
          this.loadUserProducts(user.id);
        }
        this.isLoading = false;
      })
    );
  }

  private initProfileForm(): void {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required]],
      email: [{ value: '', disabled: true }], // Email cannot be changed
      photoURL: ['']
    });
  }

  private initProductForm(product?: Product): void {
    this.productForm = this.fb.group({
      title: [product?.title || '', [Validators.required]],
      description: [product?.description || '', [Validators.required]],
      price: [product?.price || 0, [Validators.required, Validators.min(0)]],
      category: [product?.category || '', [Validators.required]],
      condition: [product?.condition || 'used', [Validators.required]],
      location: [product?.location || ''],
      tags: [product?.tags?.join(', ') || ''],
      imageUrls: [product?.imageUrls || []]
    });
  }

  private loadUserProducts(userId: string): void {
    this.userProducts$ = this.productService.getSellerProducts(userId);
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    const user = this.authService.currentUser$.pipe(
      switchMap(currentUser => {
        if (!currentUser) throw new Error('User not found');
        
        const updatedData = {
          displayName: this.profileForm.value.displayName,
          photoURL: this.profileForm.value.photoURL
        };
        
        return this.authService.updateUserProfile(currentUser.id, updatedData);
      })
    ).subscribe({
      next: () => {
        this.isEditingProfile = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
      }
    });
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.initProductForm(product);
  }

  cancelEditProduct(): void {
    this.editingProduct = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files) {
      const files = Array.from(input.files);
      
      // Limit to 5 images total (existing + new)
      const currentUrls = this.productForm.get('imageUrls')?.value || [];
      if (currentUrls.length + this.selectedFiles.length + files.length > 5) {
        alert('You can have a maximum of 5 images per product');
        return;
      }
      
      // Add new files to selected files array
      this.selectedFiles = [...this.selectedFiles, ...files];
      
      // Create preview URLs for new files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }
  
  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }
  
  // Remove an existing image URL from the product
  removeExistingImage(index: number): void {
    const currentUrls = this.productForm.get('imageUrls')?.value || [];
    currentUrls.splice(index, 1);
    this.productForm.patchValue({
      imageUrls: currentUrls
    });
  }
  
  async saveProduct(): Promise<void> {
    if (!this.productForm.valid || !this.editingProduct) return;
    
    this.submitting = true;
    
    try {
      // Process form values
      const formValue = this.productForm.value;
      const tags = formValue.tags ? 
        formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== '') : 
        [];
      
      // Create updated product object with existing image URLs
      const updatedProduct: Partial<Product> = {
        title: formValue.title,
        description: formValue.description,
        price: parseFloat(formValue.price),
        category: formValue.category,
        condition: formValue.condition,
        location: formValue.location,
        tags: tags,
        imageUrls: formValue.imageUrls
      };
      
      // If there are new files to upload
      if (this.selectedFiles.length > 0) {
        // Upload new images
        const newImageUrls = await Promise.all(
          this.selectedFiles.map(file => this.storageService.uploadProductImage(file))
        );
        
        // Combine existing and new image URLs (up to 5 total)
        const combinedUrls = [...updatedProduct.imageUrls!, ...newImageUrls].slice(0, 5);
        updatedProduct.imageUrls = combinedUrls;
      }
      
      // Update the product
      await firstValueFrom(this.productService.updateProduct(this.editingProduct.id, updatedProduct));
      
      // Reset state
      this.selectedFiles = [];
      this.imagePreviewUrls = [];
      this.editingProduct = null;
      this.submitting = false;
    } catch (error) {
      console.error('Error updating product:', error);
      this.submitting = false;
    }
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId)
        .subscribe({
          error: (error) => {
            console.error('Error deleting product:', error);
          }
        });
    }
  }
}
