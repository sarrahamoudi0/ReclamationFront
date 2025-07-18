import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReclamationComponent } from './reclamation/reclamation.component';
import { MyReclamationComponent } from './my-reclamation/my-reclamation.component';
import { ReclamtionBackofficeComponent } from './reclamtion-backoffice/reclamtion-backoffice.component';
import { ShowReclamationComponent } from './show-reclamation/show-reclamation.component';
import { ShowAdminReclamationComponent } from './show-admin-reclamation/show-admin-reclamation.component';
import { CategorieComponent } from './categorie/categorie.component';
import { RegisterComponent } from './register/register.component';
import { ActivationComponent } from './activation/activation.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NavbarComponent } from './navbar/navbar.component';
import { authGuard } from './guards/auth.guard';
import { UserRole } from './models/role';
import { NotFoundComponent } from './not-found/not-found.component';
import { UserListComponent } from './user-list/user-list.component';
import { LogsComponent } from './logs/logs.component';
import { MynavbarComponent } from './mynavbar/mynavbar.component';
import { NavbarSystemComponent } from './navbar-system/navbar-system.component';
import { ProfileupdateComponent } from './profileupdate/profileupdate.component';


const routes: Routes = [
  {path:"reclamation",component:ReclamationComponent,canActivate: [authGuard],data : { roles: [UserRole.USER]}},
  {path:"myreclamation",component:MyReclamationComponent,canActivate: [authGuard],data : { roles: [UserRole.USER]}},
  {path:"admin",component:ReclamtionBackofficeComponent,canActivate: [authGuard], data: { roles: [UserRole.ADMIN, UserRole.AGENT] }},
  {path:"reclamation/:id",component:ShowReclamationComponent,canActivate: [authGuard], data : { roles: [UserRole.USER]}},
  {path:"reclamationadmin/:id",component:ShowAdminReclamationComponent,canActivate: [authGuard], data : { roles: [UserRole.ADMIN,UserRole.AGENT]}},
  {path:"categorie",component:CategorieComponent,canActivate: [authGuard],data : { roles: [UserRole.ADMIN] }},
  {path:"register",component:RegisterComponent}, 
  { path: 'activate', component: ActivationComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgotpass', component: ForgotPasswordComponent },
  { path: 'navbar', component: NavbarComponent },
  {path:"user",component:UserListComponent,canActivate: [authGuard],data : { roles: [UserRole.ADMIN] }},
  { path: 'logs', component: LogsComponent, canActivate: [authGuard],data: { roles: [UserRole.ADMIN] }},
  { path: 'mynavbar', component: MynavbarComponent, canActivate: [authGuard],data: { roles: [UserRole.ADMIN,UserRole.AGENT] }},
  { path: 'profile', component: ProfileupdateComponent, canActivate: [authGuard],data: { roles: [UserRole.ADMIN,,UserRole.AGENT] }},





  { path: 'login', component: LoginComponent },
  { path: '**', component: NotFoundComponent },
  { path: 'admin-dashboard', component: CategorieComponent, canActivate: [authGuard],data: { roles: [UserRole.ADMIN] }},
  { path: 'reclamationclient', component: ReclamationComponent, canActivate: [authGuard],data: { roles: [UserRole.USER] }},
  { path: 'reclamationagnet', component: ReclamtionBackofficeComponent, canActivate: [authGuard],data: { roles: [UserRole.AGENT] }}





];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }