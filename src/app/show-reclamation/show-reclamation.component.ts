import { Component, OnInit } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { ActivatedRoute } from '@angular/router';
import { Statut } from '../models/Statut';
import { Priorite } from '../models/Priorite';
import { Router } from '@angular/router';
@Component({
  selector: 'app-show-reclamation',
  templateUrl: './show-reclamation.component.html',
  styleUrls: ['./show-reclamation.component.css']
})
export class ShowReclamationComponent implements OnInit {

  reclamation!: Reclamation;
  reclamations: Reclamation[] = [];
  isImageZoomed = false; 

  newReclamation: Reclamation = {
    idReclamation:"",
   
    titre:"",
    description:"",
    image_reclamation:null,
    createdDate:null,
    statut: Statut.Nouveau,
    priorite: Priorite.Faible


  };
  selectedFile: File | null = null;


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

  constructor(private reclamationService: ReclamationService, private route: ActivatedRoute,private router: Router) { }

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
    this.reclamationToUpdate = { ...r };  // Set all fields
  
    // Convert base64 image to URL for preview in popup
    if (r.image_reclamation) {
      const base64Image = 'data:image/jpeg;base64,' + r.image_reclamation;
      this.reclamationToUpdate.url = base64Image; // Set the URL for the preview image
    }
    
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
      this.reclamationToUpdate.image_reclamation = file; // Store the file directly
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.reclamationToUpdate.url = e.target.result; // Preview the image
      };
      reader.readAsDataURL(file); // Read the file for preview
    }
  }
  
  
  
  updateReclamation(): void {
    // Create FormData to include both fields and the file
    const formData = new FormData();
    
    // Add all the fields that need to be updated
    formData.append('idReclamation', this.reclamationToUpdate.idReclamation || '');
    formData.append('titre', this.reclamationToUpdate.titre || '');
    formData.append('description', this.reclamationToUpdate.description || '');
    
    // Add the image if it's available (only if it has been changed)
    if (this.reclamationToUpdate.image_reclamation) {
      formData.append('image_reclamation', this.reclamationToUpdate.image_reclamation);
    }
  
    // Make the PUT request with the form data
    this.reclamationService.updateReclamation(formData).subscribe(
      (updatedReclamation: Reclamation) => {
        console.log('Réclamation mise à jour avec succès :', updatedReclamation);
        this.closePopupUpdate(); // Close the popup
        this.getReclamation(updatedReclamation.idReclamation || ''); // Reload updated reclamation
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de la réclamation :', error);
      }
    );
  }
  
  



  onUpdateClick(): void {
    this.openPopupUpdate(this.reclamation);
  }

  zoomImage() {
    this.isImageZoomed = !this.isImageZoomed;
  }

  deleteReclamation(reclamation: Reclamation): void {
    // Show confirmation dialog before deletion
    const confirmDelete = confirm('Are you sure you want to delete this reclamation?');
    if (confirmDelete) {
      this.reclamationService.deleteReclamation(reclamation).subscribe(
        () => {
          console.log('Reclamation deleted');
          this.router.navigate(['/myreclamation']);
           
        },
        (error) => {
          console.error('Error deleting reclamation:', error);
        }
      );
    }
  }
  
}
