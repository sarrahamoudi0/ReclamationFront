import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AuthenticationService } from '../service/authentication.service';
import { ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = new FormGroup(
      {
        newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
        confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      },
      this.passwordMatchValidator
    );

    // Retrieve token from URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  passwordMatchValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { 'passwordMismatch': true };
    }
    return null;
  }
  

  onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      const payload = new ResetPassword(
        this.token,
        this.resetPasswordForm.value.newPassword,
        this.resetPasswordForm.value.confirmPassword
      );

      this.authService.resetPassword(payload).subscribe(
        response => {
          this.message = response;
        },
        err => {
          this.message = 'Error: ' + err.message;
        }
      );
    } else {
      this.message = 'Please fix the errors in the form.';
    }
  }
}
