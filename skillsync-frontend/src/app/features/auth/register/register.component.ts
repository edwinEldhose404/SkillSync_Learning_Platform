import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.registerForm.disable(); // Disable form controls properly
      
      this.authService.register(this.registerForm.value)
        .subscribe({
          next: (res) => {
            console.log('Registration successful', res);
            this.successMessage = 'Registration successful! Redirecting to login...';
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (err) => {
            console.error('Registration error:', err);
            this.isSubmitting = false;
            this.registerForm.enable(); // Re-enable form on error
            
            // Handle different error formats
            if (err.error?.message) {
              this.errorMessage = err.error.message;
            } else if (err.error?.error) {
              this.errorMessage = err.error.error;
            } else if (typeof err.error === 'string') {
              this.errorMessage = err.error;
            } else {
              this.errorMessage = 'Registration failed. Please try again.';
            }
          }
        });
    }
  }
}
