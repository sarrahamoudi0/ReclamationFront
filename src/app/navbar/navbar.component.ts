import { Component } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';

interface NavMenuItem {
  label: string;
  icon: string;
  route?: string;
  external?: boolean;
  action?: () => void;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  collapsed: boolean = false;

  // Example avatar (replace with user avatar if available)
  avatarUrl: string = 'assets/img/default-avatar.png';
  userName: string = 'Utilisateur';

  menu: NavMenuItem[] = [
    { label: 'Profile', icon: 'fa-solid fa-user', route: '/profile' },
    { label: 'Nouveau Reclamation', icon: 'fa-solid fa-envelope', route: '/reclamation' },
    { label: 'Mes Reclamations', icon: 'fa-solid fa-clipboard-list', route: '/myreclamation' },
    { label: 'A propos', icon: 'fa-solid fa-circle-info', route: '/about' }
  ];

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
