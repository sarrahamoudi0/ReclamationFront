import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { AuthenticationRequest } from '../models/AuthenticationRequest';
import { AuthenticationResponse } from '../models/AuthenticationResponse';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  emailInvalid: boolean = false;
  passwordInvalid: boolean = false;

  constructor(private authService: AuthenticationService, private router: Router) {}

  onLogin() {
    this.emailInvalid = !this.email;
    this.passwordInvalid = !this.password;

    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    const loginRequest: AuthenticationRequest = { email: this.email, password: this.password };

    this.authService.login(loginRequest).subscribe(
      (response: AuthenticationResponse) => {
        // Store the token in localStorage
        this.authService.storeToken(response.token);
        this.isLoading = false;

        // Navigate to the dashboard (or other protected route)
        this.router.navigate(['/myreclamation']);
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
        console.error(error);
      }
    );
  }
}
