import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, LoadingSpinnerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  
  featuredProducts: Product[] = [];
  recentProducts: Product[] = [];
  categories: string[] = [];
  
  loadingFeatured: boolean = true;
  loadingRecent: boolean = true;
  loadingCategories: boolean = true;
  
  ngOnInit(): void {
    // Load featured products
    this.productService.getFeaturedProducts(6).subscribe({
      next: (products) => {
        this.featuredProducts = products;
        this.loadingFeatured = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.loadingFeatured = false;
      }
    });
    
    // Load recent products
    this.productService.getRecentProducts(8).subscribe({
      next: (products) => {
        this.recentProducts = products;
        this.loadingRecent = false;
      },
      error: (error) => {
        console.error('Error loading recent products:', error);
        this.loadingRecent = false;
      }
    });
    
    // Load categories
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loadingCategories = false;
      }
    });
  }
}
