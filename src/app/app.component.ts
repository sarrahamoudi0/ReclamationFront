import { Component } from '@angular/core';
import { AuthenticationService } from './service/authentication.service';
import { UserRole } from './models/role';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'reclamation';

  constructor(public authService: AuthenticationService) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get isUser(): boolean {
    return this.authService.hasRole(UserRole.USER);
  }

  get isAgentOrAdmin(): boolean {
    return this.authService.hasRole(UserRole.AGENT) || this.authService.hasRole(UserRole.ADMIN);
  }
}
