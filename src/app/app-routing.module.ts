import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReclamationComponent } from './reclamation/reclamation.component';
import { MyReclamationComponent } from './my-reclamation/my-reclamation.component';
import { ReclamtionBackofficeComponent } from './reclamtion-backoffice/reclamtion-backoffice.component';
import { ShowReclamationComponent } from './show-reclamation/show-reclamation.component';
import { ShowAdminReclamationComponent } from './show-admin-reclamation/show-admin-reclamation.component';
import { CategorieComponent } from './categorie/categorie.component';

const routes: Routes = [
  { path: '', redirectTo: '/reclamation', pathMatch: 'full' },
  {path:"reclamation",component:ReclamationComponent},
  {path:"myreclamation",component:MyReclamationComponent},
  {path:"admin",component:ReclamtionBackofficeComponent},
  {path:"reclamation/:id",component:ShowReclamationComponent},
  {path:"reclamationadmin/:id",component:ShowAdminReclamationComponent},
  {path:"categorie",component:CategorieComponent},



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
