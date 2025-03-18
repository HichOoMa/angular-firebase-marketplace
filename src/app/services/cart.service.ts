import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'marketplace_cart';
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  
  cart$: Observable<Cart> = this.cartSubject.asObservable();

  constructor() {
    // Load cart from local storage on service initialization
    this.loadCart();
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
  }

  private loadCart(): void {
    const storedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        this.cartSubject.next(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from local storage:', error);
        this.resetCart();
      }
    }
  }

  private saveCart(cart: Cart): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(item => item.product.id === product.id);
    
    let updatedCart: Cart;
    
    if (existingItemIndex > -1) {
      // Product already in cart, update quantity
      const updatedItems = [...currentCart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      
      updatedCart = {
        items: updatedItems,
        totalItems: currentCart.totalItems + quantity,
        totalPrice: currentCart.totalPrice + (product.price * quantity)
      };
    } else {
      // Add new product to cart
      updatedCart = {
        items: [...currentCart.items, { product, quantity }],
        totalItems: currentCart.totalItems + quantity,
        totalPrice: currentCart.totalPrice + (product.price * quantity)
      };
    }
    
    this.saveCart(updatedCart);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(item => item.product.id === productId);
    
    if (existingItemIndex > -1) {
      const item = currentCart.items[existingItemIndex];
      const quantityDiff = quantity - item.quantity;
      
      const updatedItems = [...currentCart.items];
      updatedItems[existingItemIndex] = {
        ...item,
        quantity
      };
      
      const updatedCart: Cart = {
        items: updatedItems,
        totalItems: currentCart.totalItems + quantityDiff,
        totalPrice: currentCart.totalPrice + (item.product.price * quantityDiff)
      };
      
      this.saveCart(updatedCart);
    }
  }

  removeFromCart(productId: string): void {
    const currentCart = this.cartSubject.value;
    const itemToRemove = currentCart.items.find(item => item.product.id === productId);
    
    if (itemToRemove) {
      const updatedItems = currentCart.items.filter(item => item.product.id !== productId);
      
      const updatedCart: Cart = {
        items: updatedItems,
        totalItems: currentCart.totalItems - itemToRemove.quantity,
        totalPrice: currentCart.totalPrice - (itemToRemove.product.price * itemToRemove.quantity)
      };
      
      this.saveCart(updatedCart);
    }
  }

  clearCart(): void {
    this.resetCart();
  }

  private resetCart(): void {
    const emptyCart = this.getInitialCart();
    this.saveCart(emptyCart);
  }

  getCartItemCount(): Observable<number> {
    return new Observable<number>(observer => {
      this.cart$.subscribe(cart => {
        observer.next(cart.totalItems);
      });
    });
  }

  getCartTotal(): Observable<number> {
    return new Observable<number>(observer => {
      this.cart$.subscribe(cart => {
        observer.next(cart.totalPrice);
      });
    });
  }
}
