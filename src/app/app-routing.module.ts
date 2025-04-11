import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReclamationComponent } from './reclamation/reclamation.component';
import { MyReclamationComponent } from './my-reclamation/my-reclamation.component';

const routes: Routes = [
  { path: '', redirectTo: '/reclamation', pathMatch: 'full' },
  {path:"reclamation",component:ReclamationComponent},
  {path:"MyReclamation",component:MyReclamationComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
