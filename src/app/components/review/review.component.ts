import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { Review } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  @Input() productId!: string;
  @Input() sellerId!: string;
  
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  
  reviews: Review[] = [];
  currentUser: User | null = null;
  loading: boolean = true;
  submitting: boolean = false;
  
  // New review form
  newReview = {
    rating: 5,
    comment: ''
  };
  
  showReviewForm: boolean = false;
  hasReviewed: boolean = false;
  averageRating: number = 0;
  
  // Font Awesome icons
  solidStar = fasStar;
  regularStar = farStar;
  
  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (user) {
        this.checkIfUserHasReviewed();
      }
    });
    
    this.loadReviews();
  }
  
  loadReviews(): void {
    this.loading = true;
    
    this.reviewService.getReviewsByProductId(this.productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loading = false;
        this.calculateAverageRating();
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loading = false;
      }
    });
  }
  
  async checkIfUserHasReviewed(): Promise<void> {
    try {
      this.hasReviewed = await this.reviewService.hasUserReviewed(this.productId);
    } catch (error) {
      console.error('Error checking if user has reviewed:', error);
    }
  }
  
  calculateAverageRating(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }
    
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
  }
  
  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
  }
  
  submitReview(): void {
    if (!this.currentUser) {
      alert('You must be logged in to submit a review');
      return;
    }
    
    if (this.hasReviewed) {
      alert('You have already reviewed this product');
      return;
    }
    
    if (this.currentUser.id === this.sellerId) {
      alert('You cannot review your own product');
      return;
    }
    
    if (this.newReview.comment.trim() === '') {
      alert('Please enter a comment');
      return;
    }
    
    this.submitting = true;
    
    this.reviewService.addReview({
      productId: this.productId,
      rating: this.newReview.rating,
      comment: this.newReview.comment
    }).then(() => {
      this.submitting = false;
      this.showReviewForm = false;
      this.hasReviewed = true;
      this.newReview = { rating: 5, comment: '' };
      this.loadReviews();
    }).catch(error => {
      console.error('Error submitting review:', error);
      this.submitting = false;
      alert('Error submitting review. Please try again.');
    });
  }
  
  setRating(rating: number): void {
    this.newReview.rating = rating;
  }
  
  // Format date to readable string
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Check if current user is the author of a review
  isReviewAuthor(review: Review): boolean {
    return !!(this.currentUser && review.userId === this.currentUser.id);
  }
  
  // Check if current user is the seller
  isSeller(): boolean {
    return !!(this.currentUser && this.currentUser.id === this.sellerId);
  }
  
  // Get rounded average rating
  getRoundedRating(): number {
    return Math.round(this.averageRating);
  }
  
  // Generate an array of numbers for star rating display
  generateRatingArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
