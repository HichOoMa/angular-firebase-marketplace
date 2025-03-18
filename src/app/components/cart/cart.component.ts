import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FontAwesomeModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  
  cart: Cart = {
    items: [],
    totalItems: 0,
    totalPrice: 0
  };
  
  // Font Awesome icons
  faTrash = faTrash;
  faPlus = faPlus;
  faMinus = faMinus;
  
  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
  }
  
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      return;
    }
    this.cartService.updateQuantity(item.product.id, newQuantity);
  }
  
  incrementQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }
  
  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }
  
  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }
  
  clearCart(): void {
    this.cartService.clearCart();
  }
  
  // Format price with currency symbol and 2 decimal places
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
