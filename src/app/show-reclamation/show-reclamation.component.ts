import { Component, OnInit } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { ActivatedRoute } from '@angular/router';
import { Statut } from '../models/Statut';

@Component({
  selector: 'app-show-reclamation',
  templateUrl: './show-reclamation.component.html',
  styleUrls: ['./show-reclamation.component.css']
})
export class ShowReclamationComponent implements OnInit {

  reclamation!: Reclamation;

  // Objet partiel pour la mise à jour
  reclamationToUpdate: Partial<Reclamation> = {
    idReclamation: "", 
    titre: '',
    description: '',
    image_reclamation: null,
    url: '',  // To store the image preview URL
    createdDate: new Date(),
  };

  // Contrôle l'affichage du pop-up de mise à jour
  isPopupUpdateVisible: boolean = false;

  constructor(private reclamationService: ReclamationService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idReclamation = params.get('id');
      if (idReclamation) {
        this.getReclamation(idReclamation); 
      } else {
        console.error('ID de réclamation invalide :', idReclamation);
      }
    });
  }

  getReclamation(idReclamation: string): void {
    this.reclamationService.getReclamationById(idReclamation).subscribe(
      (reclamation: Reclamation) => {
        this.reclamation = reclamation;
      },
      (error) => {
        console.error('Erreur lors de la récupération de la réclamation :', error);
      }
    );
  }

  getStatutClass(statut: Statut): string {
    switch (statut) {
      case Statut.Nouveau:
        return 'statut-nouveau';
      case Statut.Encours:
        return 'statut-en-cours';
      case Statut.Escale:
        return 'statut-escalé';
      case Statut.Résolu:
        return 'statut-resolu';
      default:
        return '';
    }
  }

  openPopupUpdate(r: Reclamation): void {
    this.reclamationToUpdate = { ...r }; 
    this.isPopupUpdateVisible = true;
  }

  // Fermer le pop-up
  closePopupUpdate(): void {
    this.isPopupUpdateVisible = false;
  }

  // Handle file selection and preview
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.reclamationToUpdate.image_reclamation = file; // Store the file object
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.reclamationToUpdate.url = e.target.result; // Save the image preview URL
      };

      reader.readAsDataURL(file); // Read the file as a data URL for preview
    }
  }

  // Update the reclamation
  updateReclamation(): void {
    console.log("Mise à jour avec : ", this.reclamationToUpdate);
    this.reclamationService.updateReclamation(this.reclamationToUpdate).subscribe(
      (updatedReclamation: Reclamation) => {
        console.log('Réclamation mise à jour avec succès :', updatedReclamation);
        this.closePopupUpdate();
        this.getReclamation(updatedReclamation.idReclamation || '');
      },
      (error) => {
        console.error('Erreur lors de la mise à jour :', error);
      }
    );
  }

  onUpdateClick(): void {
    this.openPopupUpdate(this.reclamation);
  }
}
