import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../services/auth.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FontAwesomeModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  registerForm!: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/';
  
  // Font Awesome icons
  faEnvelope = faEnvelope;
  faLock = faLock;
  faUser = faUser;
  faUserPlus = faUserPlus;
  
  ngOnInit(): void {
    // Initialize form
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
    
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Check if user is already logged in
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }
  
  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    const { displayName, email, password } = this.registerForm.value;
    
    this.authService.register(email, password, displayName).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;
        
        // Handle different Firebase auth errors
        switch (error.code) {
          case 'auth/email-already-in-use':
            this.errorMessage = 'This email is already in use. Please try another one.';
            break;
          case 'auth/weak-password':
            this.errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          default:
            this.errorMessage = 'An error occurred during registration. Please try again.';
            console.error('Registration error:', error);
        }
      }
    });
  }
}
