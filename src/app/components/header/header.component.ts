import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/user.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShoppingCart, faUser, faSignOutAlt, faSignInAlt, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  
  currentUser$: Observable<User | null>;
  cartItemCount$: Observable<number>;
  searchTerm: string = '';
  
  // Font Awesome icons
  faShoppingCart = faShoppingCart;
  faUser = faUser;
  faSignOutAlt = faSignOutAlt;
  faSignInAlt = faSignInAlt;
  faPlus = faPlus;
  faSearch = faSearch;

  constructor() {
    this.currentUser$ = this.authService.currentUser$;
    this.cartItemCount$ = this.cartService.getCartItemCount();
  }

  ngOnInit(): void {
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/browse'], { 
        queryParams: { search: this.searchTerm.trim() } 
      });
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
