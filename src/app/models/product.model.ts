export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  sellerId: string;
  sellerName: string;
  createdAt: Date;
  updatedAt: Date;
  condition: 'new' | 'used' | 'refurbished';
  location?: string;
  tags?: string[];
  featured?: boolean;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: 'price' | 'date' | 'title';
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
}
