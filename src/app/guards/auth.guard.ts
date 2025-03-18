import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user: User | null) => {
      const isLoggedIn = !!user;
      
      if (isLoggedIn) {
        return true;
      }
      
      // Not logged in, redirect to login page with return URL
      return router.createUrlTree(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
    })
  );
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    take(1),
    map((user: User | null) => {
      // Check if user is logged in and is an admin
      if (user && user.isAdmin) {
        return true;
      }
      
      // If user is logged in but not admin, redirect to home
      if (user) {
        return router.createUrlTree(['/']);
      }
      
      // Not logged in, redirect to login
      return router.createUrlTree(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
    })
  );
};
