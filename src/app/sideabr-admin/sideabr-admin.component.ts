import { Component } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-sideabr-admin',
  templateUrl: './sideabr-admin.component.html',
  styleUrls: ['./sideabr-admin.component.css']
})
export class SideabrAdminComponent {
  collapsed: boolean = false;

  constructor(private authService: AuthenticationService) {}

  // Method to toggle sidebar state
  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  // Method for logging out with confirmation
  logout(): void {
    const confirmation = window.confirm('Are you sure you want to log out?');  // Confirmation dialog
    if (confirmation) {
      this.authService.logout();  // Log out if confirmed
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
}