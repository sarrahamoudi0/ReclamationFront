import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { ToastrService } from 'ngx-toastr';

import * as SockJS from 'sockjs-client';

interface Notification {
  message: string;
  // Add other properties as needed
}

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
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
   
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
}
  