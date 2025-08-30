import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { UserRole } from '../models/role';
import Swal from 'sweetalert2';

interface NavMenuItem {
  label: string;
  icon: string;
  route?: string;
  external?: boolean;
  action?: () => void;
  showForAgent?: boolean;
  showForAdmin?: boolean;
}

@Component({
  selector: 'app-sideabr-admin',
  templateUrl: './sideabr-admin.component.html',
  styleUrls: ['./sideabr-admin.component.css']
})
export class SideabrAdminComponent {
  @Input() collapsed: boolean = false;
  @Output() toggle = new EventEmitter<void>();

  menu: NavMenuItem[] = [
    { label: 'Dashboard', icon: 'fa-solid fa-house', route: '/dashboard' },
    { label: 'Les Utilisateurs', icon: 'fa-solid fa-users', route: '/user' },
    { label: 'Les Reclamations', icon: 'fa-solid fa-clipboard-list', route: '/admin' },
    { label: 'Catégories', icon: 'fa-solid fa-list', route: '/categorie' },
    { label: 'Réunions', icon: 'fa-solid fa-calendar', route: '/reunions', showForAdmin: true },
    { label: 'Mes Réunions', icon: 'fa-solid fa-calendar-check', route: '/myreunions', showForAgent: true },
    { label: 'Historique', icon: 'fa-solid fa-clock-rotate-left', route: '/logs' }
  ];

  constructor(private authService: AuthenticationService) {}

  // Method to toggle sidebar state - emits to parent
  toggleSidebar(): void {
    this.toggle.emit();
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

  isAgent(): boolean {
    return this.authService.hasRole(UserRole.AGENT);
  }
  
  isAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }
}