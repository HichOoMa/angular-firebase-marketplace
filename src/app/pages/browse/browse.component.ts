import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilter, faSort, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from '../../services/product.service';
import { Product, ProductFilter } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    FontAwesomeModule,
    ProductCardComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  
  products: Product[] = [];
  categories: string[] = [];
  loading: boolean = true;
  
  // Filter state
  filter: ProductFilter = {};
  showFilters: boolean = false;
  
  // Font Awesome icons
  faFilter = faFilter;
  faSort = faSort;
  faSearch = faSearch;
  faTimes = faTimes;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;
  
  // Conditions for filter
  conditions: string[] = ['new', 'used', 'refurbished'];
  
  // Sort options
  sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'title-asc', label: 'Name: A to Z' },
    { value: 'title-desc', label: 'Name: Z to A' }
  ];
  
  selectedSort: string = 'date-desc';
  
  ngOnInit(): void {
    // Load categories
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
    
    // Get query params from URL
    this.route.queryParams.subscribe(params => {
      // Reset filter
      this.filter = {};
      
      // Apply category filter if provided
      if (params['category']) {
        this.filter.category = params['category'];
      }
      
      // Apply search term if provided
      if (params['search']) {
        this.filter.searchTerm = params['search'];
      }
      
      // Apply featured filter if provided
      if (params['featured'] === 'true') {
        // This would be handled in the backend
        // For now, we'll just load featured products
      }
      
      // Apply sorting
      if (params['sort']) {
        this.selectedSort = params['sort'];
        this.applySorting();
      } else {
        this.selectedSort = 'date-desc';
        this.applySorting();
      }
      
      // Load products with filter
      this.loadProducts();
    });
  }
  
  loadProducts(): void {
    this.loading = true;
    
    this.productService.getProducts(this.filter).subscribe({
      next: (products) => {
        this.products = products;
        this.totalItems = products.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }
  
  applyFilters(): void {
    this.loadProducts();
    this.showFilters = false;
  }
  
  resetFilters(): void {
    this.filter = {};
    this.selectedSort = 'date-desc';
    this.applySorting();
    this.loadProducts();
  }
  
  applySorting(): void {
    const [sortBy, direction] = this.selectedSort.split('-');
    
    if (sortBy && direction) {
      this.filter.sortBy = sortBy as 'price' | 'date' | 'title';
      this.filter.sortDirection = direction as 'asc' | 'desc';
    }
  }
  
  onSortChange(): void {
    this.applySorting();
    this.loadProducts();
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  // Get paginated products
  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.products.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  // Get total pages for pagination
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  // Change page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  // Get array of page numbers for pagination
  get pages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
