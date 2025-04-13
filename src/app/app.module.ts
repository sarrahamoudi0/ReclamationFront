import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReclamationComponent } from './reclamation/reclamation.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CategorieComponent } from './categorie/categorie.component';
import { MailComponent } from './mail/mail.component';
import { FooterComponent } from './footer/footer.component';
import { MyReclamationComponent } from './my-reclamation/my-reclamation.component';
import { ReclamtionBackofficeComponent } from './reclamtion-backoffice/reclamtion-backoffice.component';

@NgModule({
  declarations: [
    AppComponent,
    ReclamationComponent,
    CategorieComponent,
    MailComponent,
    FooterComponent,
    MyReclamationComponent,
    ReclamtionBackofficeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
