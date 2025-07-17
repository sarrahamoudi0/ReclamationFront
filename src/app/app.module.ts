
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReclamationComponent } from './reclamation/reclamation.component';
import { HttpClientModule,HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CategorieComponent } from './categorie/categorie.component';
import { MailComponent } from './mail/mail.component';
import { FooterComponent } from './footer/footer.component';
import { MyReclamationComponent } from './my-reclamation/my-reclamation.component';
import { ReclamtionBackofficeComponent } from './reclamtion-backoffice/reclamtion-backoffice.component';
import { ShowReclamationComponent } from './show-reclamation/show-reclamation.component';
import { ShowAdminReclamationComponent } from './show-admin-reclamation/show-admin-reclamation.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ActivationComponent } from './activation/activation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './AuthInterceptor';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UserListComponent } from './user-list/user-list.component';
import { SideabrAdminComponent } from './sideabr-admin/sideabr-admin.component';
import { LogsComponent } from './logs/logs.component';
import {ToastrModule} from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MynavbarComponent } from './mynavbar/mynavbar.component';
import { NavbarSystemComponent } from './navbar-system/navbar-system.component';



@NgModule({
  declarations: [
    AppComponent,
    ReclamationComponent,
    CategorieComponent,
    MailComponent,
    FooterComponent,
    MyReclamationComponent,
    ReclamtionBackofficeComponent,
    ShowReclamationComponent,
    ShowAdminReclamationComponent,
    RegisterComponent,
    LoginComponent,
    ActivationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    NavbarComponent,
    NotFoundComponent,
    UserListComponent,
    SideabrAdminComponent,
    NavbarSystemComponent,
    LogsComponent,
    MynavbarComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    ToastrModule.forRoot({
      progressBar: true,
      closeButton: true,
      newestOnTop: true,
      tapToDismiss: true,
      positionClass: 'toast-bottom-right',
      timeOut: 8000
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
