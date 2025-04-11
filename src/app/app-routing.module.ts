import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReclamationComponent } from './reclamation/reclamation.component';

const routes: Routes = [
  {path:"reclamation",component:ReclamationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
