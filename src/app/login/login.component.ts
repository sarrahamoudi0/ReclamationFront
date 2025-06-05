
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { AuthenticationRequest } from '../models/AuthenticationRequest';
import { AuthenticationResponse } from '../models/AuthenticationResponse';
import { UserRole } from '../models/role';


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
      this.authService.storeToken(response.token);
      this.isLoading = false;

      const roles = this.authService.getRoles();

      if (roles.includes(UserRole.ADMIN)) {
        this.router.navigate(['/user']);
      } else if (roles.includes(UserRole.AGENT)) {
        this.router.navigate(['/admin']);
      } else if (roles.includes(UserRole.USER)) {
        this.router.navigate(['/reclamation']);
      } else {
        this.router.navigate(['/']);
      }
    },
    (error) => {
      this.isLoading = false;
      this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
      console.error(error);
    }
  );
}


}
