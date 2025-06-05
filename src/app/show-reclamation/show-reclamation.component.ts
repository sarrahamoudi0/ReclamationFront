import { Component, OnInit, HostListener } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Statut } from '../models/Statut';
import { Priorite } from '../models/Priorite';
import { Categorie } from '../models/Categorie';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface UpdateFormData {
  titre: string;
  description: string;
  image_reclamation?: File;
}

@Component({
  selector: 'app-show-reclamation',
  templateUrl: './show-reclamation.component.html',
  styleUrls: ['./show-reclamation.component.css']
})
export class ShowReclamationComponent {

}
