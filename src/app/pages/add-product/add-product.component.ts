import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faTimes, faUpload, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FontAwesomeModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  productForm!: FormGroup;
  categories: string[] = [];
  conditions: string[] = ['new', 'used', 'refurbished'];
  
  loading: boolean = false;
  submitting: boolean = false;
  
  // Selected image files
  selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  
  // Font Awesome icons
  faPlus = faPlus;
  faTimes = faTimes;
  faUpload = faUpload;
  faArrowLeft = faArrowLeft;
  
  ngOnInit(): void {
    // Check if user is logged in
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (!user) {
        this.router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: '/add-product' } 
        });
      }
    });
    
    // Load categories
    this.loading = true;
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
    
    // Initialize form
    this.initForm();
  }
  
  initForm(): void {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      condition: ['new', Validators.required],
      location: [''],
      tags: this.fb.array([this.createTagControl()])
    });
  }
  
  createTagControl(): FormGroup {
    return this.fb.group({
      value: ['']
    });
  }
  
  get tagsArray(): FormArray {
    return this.productForm.get('tags') as FormArray;
  }
  
  addTagField(): void {
    this.tagsArray.push(this.createTagControl());
  }
  
  removeTagField(index: number): void {
    this.tagsArray.removeAt(index);
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files) {
      const files = Array.from(input.files);
      
      // Limit to 5 images
      if (this.selectedFiles.length + files.length > 5) {
        alert('You can upload a maximum of 5 images');
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
  
  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    if (this.selectedFiles.length === 0) {
      alert('Please upload at least one image');
      return;
    }
    
    this.submitting = true;
    
    try {
      const formValue = this.productForm.value;
      
      // Process tags - filter out empty tags
      const tags = formValue.tags
        .map((tag: { value: string }) => tag.value.trim())
        .filter((tag: string) => tag !== '');
      
      // Create product object
      const product = {
        title: formValue.title,
        description: formValue.description,
        price: parseFloat(formValue.price),
        category: formValue.category,
        condition: formValue.condition,
        location: formValue.location,
        tags: tags,
        featured: false, // Default to not featured
        imageUrls: [] // This will be populated by the service when images are uploaded
      };
      
      // Add product to database
      const productId = await this.productService.addProduct(product, this.selectedFiles);
      
      // Navigate to product details page
      this.router.navigate(['/product', productId]);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('There was an error adding your product. Please try again.');
      this.submitting = false;
    }
  }
}
