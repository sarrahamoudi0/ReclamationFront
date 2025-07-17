import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

import * as SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { Router } from '@angular/router';
import { Notification } from '../models/Notification';
import { NotificationService } from '../service/notification.service';



interface NavMenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-navbar-system',
  templateUrl: './navbar-system.component.html',
  styleUrls: ['./navbar-system.component.css']
})
export class NavbarSystemComponent implements OnInit, OnDestroy {
  socketClient: any = null;
  private notificationSubscription: any;
  notifications: Notification[] = [];
  unreadNotificationsCount = 0;
  notificationLoaded = false;
  userRoles: string[] = [];


  avatarUrl: string = 'assets/img/default-avatar.png';
  userName: string = 'Utilisateur';
  dropdownOpen: boolean | 'notif' = false;

  constructor(private authService: AuthenticationService, private router: Router,
    private toastService: ToastrService, private notifService: NotificationService
    ) {
    this.setUserInfoFromToken();
  }

  setUserInfoFromToken(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.userName = decoded.firstname && decoded.lastname
          ? decoded.firstname + ' ' + decoded.lastname
          : (decoded.sub || 'Utilisateur');
        if (decoded.image) {
          this.avatarUrl = 'data:image/jpeg;base64,' + decoded.image;
        }
        // Extract roles from 'authorities' and strip 'ROLE_' if present
        if (decoded.authorities) {
          this.userRoles = decoded.authorities.map((role: string) => role.replace('ROLE_', ''));
        } else if (decoded.roles) {
          this.userRoles = decoded.roles;
        }
        console.log('User roles:', this.userRoles);
      } catch (e) {
        // fallback to defaults
      }
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = this.dropdownOpen === true ? false : true;
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.loadNotifications();
    this.setupNavigation();
  
    this.authService.getCurrentUser().subscribe({
      next: (currentUser) => {
        if (currentUser?.email) {
          const socket = new SockJS('http://localhost:8083/ws');
          
          this.socketClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
              this.socketClient.subscribe(`/user/${currentUser.email}/notifications`, (message: IMessage) => {
                const notif: Notification = JSON.parse(message.body);
                this.notifications.unshift(notif);
                this.toastService.info(notif.message);
                this.unreadNotificationsCount++;
              });
            },
            onStompError: (frame) => {
              console.error('Broker error:', frame.headers['message']);
            }
          });
  
          this.socketClient.activate();
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l’utilisateur :', err);
      }
    });
  }
  
  toggleNotificationDropdown(): void {
    if (this.dropdownOpen === 'notif') {
      this.dropdownOpen = false;
    } else {
      this.dropdownOpen = 'notif';
      this.unreadNotificationsCount = 0;
      if (!this.notificationLoaded) {
        this.loadNotifications();
        this.notificationLoaded = true;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.socketClient) {
      this.socketClient.disconnect();
      this.notificationSubscription?.unsubscribe?.();
      this.socketClient = null;
    }
  }

  private setupNavigation(): void {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
      if (window.location.href.endsWith(link.getAttribute('href') || '')) {
        link.classList.add('active');
      }
      link.addEventListener('click', () => {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  goToReclamation(id: string): void {
    if (this.userRoles.includes('USER')) {
      this.router.navigate(['/reclamation', id]);
    } else {
      this.router.navigate(['/reclamationadmin', id]);
    }
  }

  
  loadNotifications(): void {
    this.notifService.getMyNotifications().subscribe({
      next: (data: any[]) => {
        this.notifications = data.map(item => ({
          id: item.id,
          message: item.message || '',
          date: item.date || '',
          vue: item.vue ?? false,
          status: (item.status === 'LUE' || item.status === 'NON_LUE') ? item.status : 'NON_LUE',
          reclamationId: item.reclamationId || '',
          destinataire: item.destinataire,
          actionPar: item.actionPar
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des notifications:', err);
      }
    });
    
  }
  


}
