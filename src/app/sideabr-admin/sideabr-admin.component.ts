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
  selector: 'app-sideabr-admin',
  templateUrl: './sideabr-admin.component.html',
  styleUrls: ['./sideabr-admin.component.css']
})
export class SideabrAdminComponent {
  collapsed: boolean = false;

  menu: NavMenuItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-house', route: '/admin-dashboard' },
    { label: 'Profile', icon: 'fa-solid fa-user', route: '' },
    { label: 'Les Utilisateurs', icon: 'fa-solid fa-users', route: '/user' },
    { label: 'Les Reclamations', icon: 'fa-solid fa-clipboard-list', route: '/admin' },
    { label: 'Catégories', icon: 'fa-solid fa-list', route: '/categorie' },
    { label: 'Historique', icon: 'fa-solid fa-clock-rotate-left', route: '/logs' }
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
