import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import Swal from 'sweetalert2';

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
  @Input() collapsed: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  // Example avatar (replace with user avatar if available)
  avatarUrl: string = 'assets/img/default-avatar.png';
  userName: string = 'Utilisateur';

  menu: NavMenuItem[] = [
    { label: 'Reclamation', icon: 'fa-solid fa-envelope', route: '/reclamation' },
    { label: 'Mes Reclamations', icon: 'fa-solid fa-clipboard-list', route: '/myreclamation' },
  ];

  constructor(private authService: AuthenticationService) {}

  // Method to toggle sidebar state
  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  // Method for logging out with confirmation
 logout(): void {
  Swal.fire({
    title: 'Déconnexion',
    text: 'Voulez-vous vraiment vous déconnecter ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e47429',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Oui, déconnecter',
    cancelButtonText: 'Annuler',
    customClass: {
      popup: 'swal2-popup-custom'
    }
  }).then((result: import('sweetalert2').SweetAlertResult) => {
    if (result.isConfirmed) {
      this.authService.logout();
    }
  });
}

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
}
