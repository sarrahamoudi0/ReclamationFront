import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { ToastrService } from 'ngx-toastr';

import * as SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { Router } from '@angular/router';


import { Notification } from '../models/Notification';

@Component({
  selector: 'app-mynavbar',
  templateUrl: './mynavbar.component.html',
  styleUrls: ['./mynavbar.component.css']
})
export class MynavbarComponent implements OnInit, OnDestroy {

  socketClient: any = null;
  private notificationSubscription: any;
  notifications: Notification[] = [];
  unreadNotificationsCount = 0;

  constructor(
    private authService: AuthenticationService,
    private toastService: ToastrService,
    private router:Router
  ) {}


  
  ngOnInit(): void {
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
    this.router.navigate(['/reclamationadmin', id]); // adjust your route
  }
}
  