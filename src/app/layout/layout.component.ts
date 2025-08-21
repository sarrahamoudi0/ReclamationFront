import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { UserRole } from '../models/role';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  isLoggedIn = false;
  isUser = false;
  isAgentOrAdmin = false;
  sidebarCollapsed = false; // Sidebar state

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.updateAuthState();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private updateAuthState(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      const roles = this.authService.getRoles();
      this.isUser = roles.includes(UserRole.USER);
      this.isAgentOrAdmin = roles.includes(UserRole.ADMIN) || roles.includes(UserRole.AGENT);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
