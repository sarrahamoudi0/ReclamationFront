import { Component, OnInit, HostListener } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Statut } from '../models/Statut';
import { Priorite } from '../models/Priorite';
import { CategorieService } from '../service/categorie.service'; 
import { Categorie } from "../models/Categorie";

@Component({
  selector: 'app-show-admin-reclamation',
  templateUrl: './show-admin-reclamation.component.html',
  styleUrls: ['./show-admin-reclamation.component.css']
})
export class ShowAdminReclamationComponent implements OnInit {
  reclamation!: Reclamation;
    categories: Categorie[] = []; 
   selectedCategorie: Categorie | undefined;
  showCategorieList = false;
  isImageZoomed = false;

  statutValues: Statut[] = Object.values(Statut);
  selectedStatut: Statut = Statut.Nouveau;
  showStatutList = false;
  statuts: Statut[] = this.statutValues;

  prioriteValues: Priorite[] = Object.values(Priorite);
  selectedPriorite: Priorite = Priorite.Faible;
  showPrioriteList = false;

  constructor(
    private reclamationService: ReclamationService,
    private route: ActivatedRoute,
     private categorieService: CategorieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idReclamation = params.get('id');
      if (idReclamation) {
        this.getReclamation(idReclamation);
      }
    });
      this.getCategories();
  }

  getReclamation(idReclamation: string): void {
    this.reclamationService.getReclamationById(idReclamation).subscribe({
      next: (reclamation) => {
        this.reclamation = reclamation;
        this.selectedStatut = reclamation.statut as Statut;
        this.selectedPriorite = reclamation.priorite as Priorite;
      },
      error: (error) => console.error('Erreur de récupération:', error)
    });
  }

    getCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories; 
      },
      error: (error) => console.error('Error fetching categories:', error)
    });
  }
affecterCategorie(): void {
  if (this.selectedCategorie && this.reclamation) {
    const payload = {
      idReclamation: this.reclamation.idReclamation || '',
      idCategorie: this.selectedCategorie.idCategorie || ''
    };

    this.reclamationService.assignCategorieToReclamation(payload.idReclamation, payload.idCategorie).subscribe({
      next: () => console.log('Catégorie affectée avec succès'),
      error: (error) => console.error('Erreur lors de l\'affectation de la catégorie :', error)
    });
  }
}


selectCategorie(categorie: Categorie): void {
  this.selectedCategorie = categorie;
  this.affecterCategorie(); // Assign the category
  this.showCategorieList = false; // Close the category list
}

toggleCategorieList(event: MouseEvent): void {
  this.showCategorieList = !this.showCategorieList;
  event.stopPropagation(); // Prevent click from closing the dropdown immediately
}



  getStatutClass(statut: Statut) {
    return {
      'statut-nouveau': statut === Statut.Nouveau,
      'statut-en-cours': statut === Statut.Encours,
      'statut-escalé': statut === Statut.Escale,
      'statut-resolu': statut === Statut.Résolu,
    };
  }

  getPrioriteClass(priorite: Priorite): string {
    switch (priorite) {
      case Priorite.Élevé:
        return 'badge-high';
      case Priorite.Faible:
        return 'badge-low';
      case Priorite.Moyenne:
        return 'badge-medium';
      default:
        return 'badge-default';
    }
  }

  zoomImage(): void {
    this.isImageZoomed = !this.isImageZoomed;
  }

  updateStatut(): void {
    if (!this.selectedStatut || !this.reclamation || !this.reclamation.idReclamation) {
      console.error('Statut invalide ou réclamation non trouvée.');
      return;
    }

    this.reclamationService.updateReclamationStatut(this.reclamation.idReclamation, this.selectedStatut)
      .subscribe(
        (updatedReclamation) => {
          this.reclamation = updatedReclamation;
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du statut :', error);
        }
      );
  }

  updatePriorite(): void {
    if (!this.selectedPriorite || !this.reclamation || !this.reclamation.idReclamation) {
      console.error('Priorité invalide ou réclamation non trouvée.');
      return;
    }

    this.reclamationService.updateReclamationPriority(this.reclamation.idReclamation, this.selectedPriorite)
      .subscribe(
        (updatedReclamation) => {
          this.reclamation = updatedReclamation;
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de la priorité :', error);
        }
      );
  }

  toggleStatutList(event: MouseEvent): void {
    this.showStatutList = !this.showStatutList;
    if (this.showStatutList) {
      this.showPrioriteList = false; // Masquer le dropdown Priorité si Statut est visible
    }
  }
  
  togglePrioriteList(event: MouseEvent): void {
    this.showPrioriteList = !this.showPrioriteList;
    if (this.showPrioriteList) {
      this.showStatutList = false; // Masquer le dropdown Statut si Priorité est visible
    }
  }
  

  selectStatut(statut: Statut) {
    this.selectedStatut = statut;
    this.showStatutList = false; // Hide the list after selection
    this.updateStatut();         // Update the statut
  }

  selectPriorite(priorite: Priorite) {
    this.selectedPriorite = priorite;
    this.showPrioriteList = false; // Hide the list after selection
    this.updatePriorite();         // Update the priorite
  }

  // HostListener to detect clicks outside and close the dropdown
@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent): void {
  const statutDropdown = document.querySelector('.statut-list');
  const prioriteDropdown = document.querySelector('.priorite-list');
  const statutContainer = document.querySelector('.statut-priorite-container');
  const categorieDropdown = document.querySelector('.categorie-list');
  const categorieButton = document.querySelector('.categorie-badge');

  // Close dropdown if clicked outside
  if (
    statutDropdown && !statutDropdown.contains(event.target as Node) &&
    prioriteDropdown && !prioriteDropdown.contains(event.target as Node) &&
    statutContainer && !statutContainer.contains(event.target as Node) &&
    categorieDropdown && !categorieDropdown.contains(event.target as Node) &&
    categorieButton && !categorieButton.contains(event.target as Node)
  ) {
    this.showStatutList = false;
    this.showPrioriteList = false;
    this.showCategorieList = false; // Close the category list when clicked outside
  }
}

 

}
