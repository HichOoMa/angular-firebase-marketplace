import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShoppingCart, faHeart, faShare, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';
import { ChatComponent } from '../../components/chat/chat.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FontAwesomeModule,
    LoadingSpinnerComponent,
    ChatComponent
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  
  product: Product | null = null;
  loading: boolean = true;
  currentUser: User | null = null;
  selectedImageIndex: number = 0;
  
  // Font Awesome icons
  faShoppingCart = faShoppingCart;
  faHeart = faHeart;
  faShare = faShare;
  faArrowLeft = faArrowLeft;
  
  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
    
    // Get product ID from route params
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      
      if (productId) {
        this.loadProduct(productId);
      } else {
        this.router.navigate(['/browse']);
      }
    });
  }
  
  loadProduct(productId: string): void {
    this.loading = true;
    
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
        this.router.navigate(['/browse']);
      }
    });
  }
  
  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product);
    }
  }
  
  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }
  
  // Format price with currency symbol and 2 decimal places
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
  
  // Format date to readable string
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Check if current user is the seller
  isSeller(): boolean {
    return !!(this.currentUser && this.product && this.currentUser.id === this.product.sellerId);
  }
  
  // Share product
  shareProduct(): void {
    if (navigator.share && this.product) {
      navigator.share({
        title: this.product.title,
        text: this.product.description,
        url: window.location.href
      }).catch(error => console.error('Error sharing product:', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      // Copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Product URL copied to clipboard!'))
        .catch(error => console.error('Error copying to clipboard:', error));
    }
  }
}
