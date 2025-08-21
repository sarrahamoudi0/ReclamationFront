import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component'; // <- جديد
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
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReunionListComponent } from './reunion/reunion-list/reunion-list.component';
import { ReunionFormComponent } from './reunion/reunion-form/reunion-form.component';
import { ReunionViewComponent } from './reunion/reunion-view/reunion-view.component';
import { ReunionAgentComponent } from './reunion/reunion-agent/reunion-agent.component';
import { UserListComponent } from './user-list/user-list.component';
import { LogsComponent } from './logs/logs.component';
import { ProfileupdateComponent } from './profileupdate/profileupdate.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { UserRole } from './models/role';
import { PresenceManagementComponent } from './presence/presence-management/presence-management.component';

const routes: Routes = [
  // Public routes (login/register/forgot/reset)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'activate', component: ActivationComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgotpass', component: ForgotPasswordComponent },

  // Protected routes wrapped in LayoutComponent
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, data: { roles: [UserRole.ADMIN] } },
      { path: 'reclamation', component: ReclamationComponent, data: { roles: [UserRole.USER] } },
      { path: 'myreclamation', component: MyReclamationComponent, data: { roles: [UserRole.USER] } },
      { path: 'admin', component: ReclamtionBackofficeComponent, data: { roles: [UserRole.ADMIN, UserRole.AGENT] } },
      { path: 'reclamation/:id', component: ShowReclamationComponent, data: { roles: [UserRole.USER] } },
      { path: 'reclamationadmin/:id', component: ShowAdminReclamationComponent, data: { roles: [UserRole.ADMIN, UserRole.AGENT] } },
      { path: 'categorie', component: CategorieComponent, data: { roles: [UserRole.ADMIN] } },
      { path: 'user', component: UserListComponent, data: { roles: [UserRole.ADMIN] } },
      { path: 'logs', component: LogsComponent, data: { roles: [UserRole.ADMIN] } },
      { path: 'profile', component: ProfileupdateComponent, data: { roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.USER] } },

      // Reunion routes
      { path: 'reunions', component: ReunionListComponent, data: { roles: [UserRole.ADMIN] } },
      { path: 'reunions/create', component: ReunionFormComponent, data: { roles: [UserRole.ADMIN] } },
      { path: 'reunions/edit/:id', component: ReunionFormComponent, data: { roles: [UserRole.ADMIN] } },
      { path: 'reunions/view/:id', component: ReunionViewComponent, data: { roles: [UserRole.ADMIN, UserRole.AGENT] } },
      { path: 'myreunions', component: ReunionAgentComponent, data: { roles: [UserRole.AGENT] } },
      { path: 'presence', component: PresenceManagementComponent, data: { roles: [UserRole.ADMIN] } },

      // Redirections / alias
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // 404
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
