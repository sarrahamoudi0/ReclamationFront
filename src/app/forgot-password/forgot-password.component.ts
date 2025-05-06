import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  submissionStatus: { message: string, success: boolean } | null = null;
  isSubmitting: boolean = false;

  constructor(private authService: AuthenticationService) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  // Method called on form submission
  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;

      // Set submitting state to true to show loading indicator
      this.isSubmitting = true;

      this.authService.sendResetPasswordEmail(email).subscribe(
        (response) => {
          this.submissionStatus = {
            message: 'Un email de réinitialisation a été envoyé avec succès !',
            success: true
          };

          // Reset form and submitting state after successful submission
          this.forgotPasswordForm.reset();
          this.isSubmitting = false;
        },
        (error) => {
          this.submissionStatus = {
            message: 'Erreur: ' + (error?.message || 'Une erreur est survenue'),
            success: false
          };

          // Reset submitting state in case of error
          this.isSubmitting = false;
        }
      );
    } else {
      this.submissionStatus = {
        message: 'Veuillez entrer un email valide.',
        success: false
      };
    }
  }

  // Getter for easier access to the email form control in template
  get email() {
    return this.forgotPasswordForm.get('email');
  }
}
