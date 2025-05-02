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


const routes: Routes = [
  {path:"reclamation",component:ReclamationComponent},
  {path:"myreclamation",component:MyReclamationComponent},
  {path:"admin",component:ReclamtionBackofficeComponent},
  {path:"reclamation/:id",component:ShowReclamationComponent},
  {path:"reclamationadmin/:id",component:ShowAdminReclamationComponent},
  {path:"categorie",component:CategorieComponent},
  {path:"register",component:RegisterComponent},
  { path: 'activate', component: ActivationComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'forgotpass', component: ForgotPasswordComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' }, 

  { path: 'login', component: LoginComponent },






];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
