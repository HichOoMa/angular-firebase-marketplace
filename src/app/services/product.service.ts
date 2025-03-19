import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentReference,
  getDocs
} from '@angular/fire/firestore';
import { Observable, from, map, of, switchMap, firstValueFrom } from 'rxjs';
import { Product, ProductFilter } from '../models/product.model';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firestore = inject(Firestore);
  private storageService = inject(StorageService);
  private authService = inject(AuthService);
  
  private productsCollection = collection(this.firestore, 'products');

  constructor() {}

  getProducts(filter?: ProductFilter): Observable<Product[]> {
    let productQuery = query(this.productsCollection);
    
    if (filter) {
      if (filter.category) {
        productQuery = query(productQuery, where('category', '==', filter.category));
      }
      
      if (filter.minPrice !== undefined) {
        productQuery = query(productQuery, where('price', '>=', filter.minPrice));
      }
      
      if (filter.maxPrice !== undefined) {
        productQuery = query(productQuery, where('price', '<=', filter.maxPrice));
      }
      
      if (filter.condition) {
        productQuery = query(productQuery, where('condition', '==', filter.condition));
      }
      
      if (filter.sortBy) {
        const direction = filter.sortDirection === 'desc' ? 'desc' : 'asc';
        productQuery = query(productQuery, orderBy(filter.sortBy, direction));
      } else {
        // Default sort by date
        productQuery = query(productQuery, orderBy('createdAt', 'desc'));
      }
    } else {
      // Default sort by date if no filter provided
      productQuery = query(productQuery, orderBy('createdAt', 'desc'));
    }
    
    return collectionData(productQuery, { idField: 'id' }) as Observable<Product[]>;
  }

  getProductById(id: string): Observable<Product | null> {
    const productDoc = doc(this.firestore, `products/${id}`);
    return docData(productDoc, { idField: 'id' }) as Observable<Product>;
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    // Firebase doesn't support full-text search natively
    // This is a simple implementation that searches in title and description
    // For a production app, consider using Algolia or Elasticsearch
    return this.getProducts().pipe(
      map(products => {
        const term = searchTerm.toLowerCase();
        return products.filter(product => 
          product.title.toLowerCase().includes(term) || 
          product.description.toLowerCase().includes(term) ||
          (product.tags && product.tags.some(tag => tag.toLowerCase().includes(term)))
        );
      })
    );
  }

  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sellerId' | 'sellerName'>, 
                  imageFiles: File[]): Promise<string> {
    // Upload images first
    const imageUrls = await Promise.all(
      imageFiles.map(file => this.storageService.uploadProductImage(file))
    );
    
    // Get current user
    const currentUser = await firstValueFrom(this.authService.currentUser$.pipe(
      map(user => {
        if (!user) throw new Error('User must be logged in to add a product');
        return user;
      })
    ));
    
    const newProduct: Omit<Product, 'id'> = {
      ...product,
      imageUrls,
      sellerId: currentUser!.id,
      sellerName: currentUser!.displayName,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(this.productsCollection, newProduct);
    return docRef.id;
  }

  updateProduct(id: string, product: Partial<Product>): Observable<void> {
    const productDoc = doc(this.firestore, `products/${id}`);
    return from(updateDoc(productDoc, { 
      ...product, 
      updatedAt: new Date() 
    }));
  }

  deleteProduct(id: string): Observable<void> {
    const productDoc = doc(this.firestore, `products/${id}`);
    return from(deleteDoc(productDoc));
  }

  getFeaturedProducts(count: number = 6): Observable<Product[]> {
    const featuredQuery = query(
      this.productsCollection,
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    
    return collectionData(featuredQuery, { idField: 'id' }) as Observable<Product[]>;
  }

  getRecentProducts(count: number = 8): Observable<Product[]> {
    const recentQuery = query(
      this.productsCollection,
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    
    return collectionData(recentQuery, { idField: 'id' }) as Observable<Product[]>;
  }

  getSellerProducts(sellerId: string): Observable<Product[]> {
    const sellerQuery = query(
      this.productsCollection,
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    
    return collectionData(sellerQuery, { idField: 'id' }) as Observable<Product[]>;
  }

  getCategories(): Observable<string[]> {
    return of([
      'Electronics',
      'Clothing',
      'Home & Garden',
      'Sporting Goods',
      'Automotive',
      'Toys & Hobbies',
      'Health & Beauty',
      'Other'
    ]);
  }
}
