import { Component, OnInit } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { Router } from '@angular/router';
import { Statut } from 'src/app/models/Statut';
import { Priorite } from '../models/Priorite';

@Component({
  selector: 'app-reclamation',
  templateUrl: './reclamation.component.html',
  styleUrls: ['./reclamation.component.css']
})
export class ReclamationComponent implements OnInit {

  reclamations : Reclamation [] = [];
  selectedFile: File | null = null;

  constructor(private reclamationservice: ReclamationService, private router: Router) { }

  ngOnInit(): void {
    console.log(' test');
  }

  newReclamation: Reclamation = {
    idReclamation:"",
    nom: "",
    prenom: "",
    email:"",
    num:"",
    titre:"",
    description:"",
    image_reclamation:null,
    createdDate:null,
    statut: Statut.Nouveau,
    priorite: Priorite.Faible


  };

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  submitReclamation(): void {
    const formData = new FormData();

    formData.append('nom', this.newReclamation.nom);
    formData.append('prenom', this.newReclamation.prenom);
    formData.append('email', this.newReclamation.email);
    formData.append('num', this.newReclamation.num);
    formData.append('titre', this.newReclamation.titre);
    formData.append('description', this.newReclamation.description);

    if (this.selectedFile) {
      formData.append('image_reclamation', this.selectedFile);
    }

    this.reclamationservice.addReclamation(formData).subscribe({
      next: (res) => {
        console.log('Réclamation envoyée avec succès :', res);
        this.newReclamation = new Reclamation(); // Reset the form data
        this.selectedFile = null; // Clear the file selection

        // Navigate to "My Reclamations" page after successful submission
        this.router.navigate(['/myreclamation']); // Navigates to the "MyReclamationComponent"
      },
      error: (err) => {
        console.error('Erreur lors de l’envoi de la réclamation :', err);
      }
    });
  }

  }
