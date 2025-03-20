import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShoppingCart, faStar as fasStar, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() featured: boolean = false;
  
  private cartService = inject(CartService);
  private reviewService = inject(ReviewService);
  
  averageRating: number = 0;
  
  // Font Awesome icons
  faShoppingCart = faShoppingCart;
  solidStar = fasStar;
  regularStar = farStar;
  faHeart = faHeart;
  
  ngOnInit(): void {
    this.loadAverageRating();
  }
  
  loadAverageRating(): void {
    this.reviewService.getAverageRating(this.product.id).subscribe(rating => {
      this.averageRating = rating;
    });
  }
  
  // Generate an array of numbers for star rating display
  generateRatingArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }
  
  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(this.product);
  }
  
  // Format price with currency symbol and 2 decimal places
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
  
  // Get the first image URL or a placeholder if no images
  get mainImage(): string {
    return this.product.imageUrls && this.product.imageUrls.length > 0
      ? this.product.imageUrls[0]
      : 'assets/images/placeholder.jpg';
  }
  
  // Format the date to a readable string
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
