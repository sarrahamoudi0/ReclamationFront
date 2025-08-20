import { Component, HostListener } from '@angular/core';
import { AuthenticationService } from './service/authentication.service';
import { UserRole } from './models/role';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'reclamation';
  sidebarOpen = false; // track sidebar state (for responsive view)

  constructor(public authService: AuthenticationService) {}

  // === Auth checks ===
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get isUser(): boolean {
    return this.authService.hasRole(UserRole.USER);
  }

  get isAgentOrAdmin(): boolean {
    return this.authService.hasRole(UserRole.AGENT) || this.authService.hasRole(UserRole.ADMIN);
  }

  // === Sidebar toggle ===
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  // === Auto-close sidebar when clicking outside (on mobile) ===
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');

    if (
      this.sidebarOpen &&
      sidebar &&
      !sidebar.contains(event.target as Node) &&
      toggleBtn &&
      !toggleBtn.contains(event.target as Node)
    ) {
      this.closeSidebar();
    }
  }
}
