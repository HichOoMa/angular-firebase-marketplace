import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../services/auth.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FontAwesomeModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  loginForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/';
  
  // Font Awesome icons
  faEnvelope = faEnvelope;
  faLock = faLock;
  faSignInAlt = faSignInAlt;
  
  ngOnInit(): void {
    // Initialize form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Check if user is already logged in
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        
        // Handle different Firebase auth errors
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            this.errorMessage = 'Invalid email or password';
            break;
          case 'auth/too-many-requests':
            this.errorMessage = 'Too many failed login attempts. Please try again later.';
            break;
          default:
            this.errorMessage = 'An error occurred during login. Please try again.';
            console.error('Login error:', error);
        }
      }
    });
  }
}
