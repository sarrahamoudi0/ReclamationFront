import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';
import { UserRole } from '../models/role';
import { DateTime} from 'luxon'
import { AuthenticationService } from '../service/authentication.service';


@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {

  constructor(private router: Router, private authService: AuthenticationService) {}
  goHome(event: MouseEvent): void {
    event.preventDefault();
  
    const token = this.authService.getToken();
  
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
  
    const roles = this.authService.getRoles();
  
    if (roles.includes(UserRole.USER)) {
      this.router.navigate(['/reclamation']);
    } else if (roles.includes(UserRole.AGENT)) {
      this.router.navigate(['/admin']);
    } else if (roles.includes(UserRole.ADMIN)) {
      this.router.navigate(['/admin']);
    } else {
      alert('You do not have permission to access this page.');
      this.router.navigate(['/login']);
    }
  }
  
  

}
