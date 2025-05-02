import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '../service/authentication.service';
import { ActivatedRoute } from '@angular/router';  // Import ActivatedRoute to fetch token from URL

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  message: string | null = null;
  token: string | null = null;  // Variable to hold the token

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute  // Inject ActivatedRoute to fetch token
  ) {
    // Initialize form group
    this.resetPasswordForm = new FormGroup(
      {
        newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      },
      this.passwordMatchValidator // Apply custom validator
    );

    // Retrieve token from URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];  // Assuming token is passed as a query parameter
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    // If passwords don't match, return error
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  // Handle form submission
  onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      const resetRequest = {
        token: this.token,  // Use dynamic token from URL
        newPassword: this.resetPasswordForm.get('newPassword')?.value,
        confirmPassword: this.resetPasswordForm.get('confirmPassword')?.value  // Include confirmPassword
      };
      this.authService.resetPassword(resetRequest).subscribe(
        (response) => {
          this.message = 'Password successfully reset!';
        },
        (error) => {
          this.message = 'Error: ' + error.message;
        }
      );
    } else {
      this.message = 'Please fix the errors in the form.';
    }
  }}
