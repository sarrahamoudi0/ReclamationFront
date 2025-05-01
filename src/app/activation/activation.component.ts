import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.css']
})
export class ActivationComponent {
  activationCode: string = '';
  isLoading: boolean = false;
  isInvalid: boolean = false;
  message: string = '';
  isSuccess: boolean = false;

  constructor(private authService: AuthenticationService, private router: Router) {}

  onActivate() {
    if (!this.activationCode || this.activationCode.length !== 6) {
      this.isInvalid = true;
      this.message = "Le code d'activation doit contenir 6 caractères.";
      return;
    }

    this.isLoading = true;
    this.isInvalid = false;
    this.message = '';
    this.isSuccess = false;

    this.authService.activateAccount(this.activationCode).subscribe(
      () => {
        this.message = 'Compte activé avec succès !';
        this.isSuccess = true;
        this.router.navigate(['/login']); // rediriger vers login après succès
      },
      (error) => {
        console.error('Erreur lors de l\'activation :', error); // afficher l'erreur exacte
        this.message = error.message || 'Une erreur s\'est produite.';
        this.isInvalid = true;
      }
    ).add(() => {
      this.isLoading = false;
    });
  }

  onCodeInput() {
    if (this.activationCode.length === 6) {
      this.isInvalid = false;
      this.message = '';
    }
  }
}
