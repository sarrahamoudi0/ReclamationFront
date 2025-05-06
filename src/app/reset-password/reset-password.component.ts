import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '../service/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPassword } from '../models/ResetPassword';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  message: string | null = null;
  token: string | null = null;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize the form with validation
    this.resetPasswordForm = new FormGroup(
      {
        newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      },
      this.passwordMatchValidator
    );

    // Retrieve token from URL query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  // Password mismatch validation
  passwordMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  // Handle form submission
  onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      const payload = new ResetPassword(
        this.token,
        this.resetPasswordForm.value.newPassword,
        this.resetPasswordForm.value.confirmPassword
      );

      this.authService.resetPassword(payload).subscribe(
        response => {
          this.message = 'Password reset successfully!';
          setTimeout(() => {
            this.router.navigate(['/login']); // Navigate to login page
          }, 1500); // Optional delay to show success message
        },
        err => {
          this.message = `Error: ${err.message || 'An error occurred'}`;
        }
      );
    } else {
      this.message = 'Please fix the errors in the form or provide a valid token.';
    }
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }
}
