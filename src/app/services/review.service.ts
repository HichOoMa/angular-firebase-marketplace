import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDocs
} from '@angular/fire/firestore';
import { Observable, from, map, firstValueFrom } from 'rxjs';
import { Review } from '../models/review.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  
  private reviewsCollection = collection(this.firestore, 'reviews');

  constructor() {}

  getReviewsByProductId(productId: string): Observable<Review[]> {
    const reviewsQuery = query(
      this.reviewsCollection,
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }

  async addReview(review: Omit<Review, 'id' | 'userId' | 'userName' | 'createdAt'>): Promise<string> {
    // Get current user
    const currentUser = await firstValueFrom(this.authService.currentUser$.pipe(
      map(user => {
        if (!user) throw new Error('User must be logged in to add a review');
        return user;
      })
    ));
    
    const newReview: Omit<Review, 'id'> = {
      ...review,
      userId: currentUser.id,
      userName: currentUser.displayName,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(this.reviewsCollection, newReview);
    return docRef.id;
  }

  updateReview(id: string, review: Partial<Review>): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${id}`);
    return from(updateDoc(reviewDoc, review));
  }

  deleteReview(id: string): Observable<void> {
    const reviewDoc = doc(this.firestore, `reviews/${id}`);
    return from(deleteDoc(reviewDoc));
  }

  async hasUserReviewed(productId: string): Promise<boolean> {
    const currentUser = await firstValueFrom(this.authService.currentUser$);
    
    if (!currentUser) {
      return false;
    }
    
    const reviewsQuery = query(
      this.reviewsCollection,
      where('productId', '==', productId),
      where('userId', '==', currentUser.id)
    );
    
    const querySnapshot = await getDocs(reviewsQuery);
    return !querySnapshot.empty;
  }

  getAverageRating(productId: string): Observable<number> {
    return this.getReviewsByProductId(productId).pipe(
      map(reviews => {
        if (reviews.length === 0) {
          return 0;
        }
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / reviews.length;
      })
    );
  }
}
