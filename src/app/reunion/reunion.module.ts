import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ReunionListComponent } from './reunion-list/reunion-list.component';
import { ReunionFormComponent } from './reunion-form/reunion-form.component';
import { ReunionViewComponent } from './reunion-view/reunion-view.component';
import { ReunionAgentComponent } from './reunion-agent/reunion-agent.component';

@NgModule({
  declarations: [
    ReunionListComponent,
    ReunionFormComponent,
    ReunionViewComponent,
    ReunionAgentComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    ReunionListComponent,
    ReunionFormComponent,
    ReunionViewComponent,
    ReunionAgentComponent
  ]
})
export class ReunionModule { } 