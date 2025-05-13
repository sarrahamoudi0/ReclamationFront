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
  selectedSousCategorie: Categorie | null | undefined;  showCategorieList = false;
  isImageZoomed = false;

  statutValues: Statut[] = Object.values(Statut);
  selectedStatut: Statut = Statut.Nouveau;
  showStatutList = false;

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
      error: (error) => console.error('Erreur lors de la récupération des catégories :', error)
    });
  }

  toggleCategorieList(event: MouseEvent): void {
    this.showCategorieList = !this.showCategorieList;
    event.stopPropagation();
  }

  selectMainCategorie(categorie: Categorie, event: MouseEvent): void {
    this.selectedCategorie = categorie; // Set the selected main category

    // If the selected category has subcategories, select the first one by default
    if (categorie.sousCategories && categorie.sousCategories.length > 0) {
      this.selectedSousCategorie = categorie.sousCategories[0]; // Select the first subcategory
      this.reclamation.sousCategorie = this.selectedSousCategorie; // Assign subcategory to reclamation
    } else {
      // If no subcategories exist, set it to null
      this.selectedSousCategorie = null;
      this.reclamation.sousCategorie = null;
    }

    // Now, assign the main category to the reclamation
    this.reclamation.categorie = this.selectedCategorie;

    // Call the function to update the backend with the selected category and subcategory
    this.updateCategorie();
  }

  selectSousCategorie(sousCategorie: Categorie, event: MouseEvent): void {
    event.stopPropagation();

    if (this.reclamation && this.selectedCategorie) {
      const idReclamation = this.reclamation.idReclamation || '';
      const idCategorie = this.selectedCategorie.idCategorie || '';
      const idSousCategorie = sousCategorie.idCategorie || '';

      this.reclamationService.assignOneCategorieToReclamation(idReclamation, idCategorie, idSousCategorie).subscribe({
        next: () => {
          this.reclamation.categorie = this.selectedCategorie!;
          this.reclamation.sousCategorie = sousCategorie;
          this.showCategorieList = false;
          console.log('Catégorie et sous-catégorie mises à jour avec succès.');
        },
        error: (error) => console.error('Erreur lors de l\'affectation de la catégorie :', error)
      });
    }
  }

  // Statut / Priorité
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
      case Priorite.Élevé: return 'badge-high';
      case Priorite.Faible: return 'badge-low';
      case Priorite.Moyenne: return 'badge-medium';
      default: return 'badge-default';
    }
  }

  updateStatut(): void {
    if (!this.selectedStatut || !this.reclamation?.idReclamation) {
      console.error('Statut invalide ou réclamation non trouvée.');
      return;
    }

    this.reclamationService.updateReclamationStatut(this.reclamation.idReclamation, this.selectedStatut)
      .subscribe({
        next: updatedReclamation => this.reclamation = updatedReclamation,
        error: error => console.error('Erreur lors de la mise à jour du statut :', error)
      });
  }

  updatePriorite(): void {
    if (!this.selectedPriorite || !this.reclamation?.idReclamation) {
      console.error('Priorité invalide ou réclamation non trouvée.');
      return;
    }

    this.reclamationService.updateReclamationPriority(this.reclamation.idReclamation, this.selectedPriorite)
      .subscribe({
        next: updatedReclamation => this.reclamation = updatedReclamation,
        error: error => console.error('Erreur lors de la mise à jour de la priorité :', error)
      });
  }

  updateCategorie(): void {
    if (this.reclamation && this.reclamation.idReclamation) {
      const idReclamation = this.reclamation.idReclamation;
      const idCategorie = this.reclamation.categorie?.idCategorie || '';
      const idSousCategorie = this.reclamation.sousCategorie?.idCategorie || '';

      this.reclamationService.assignOneCategorieToReclamation(idReclamation, idCategorie, idSousCategorie)
        .subscribe({
          next: () => {
            console.log('Catégorie et sous-catégorie mises à jour avec succès.');
          },
          error: (error) => console.error('Erreur lors de l\'affectation de la catégorie :', error)
        });
    }
  }

  toggleStatutList(event: MouseEvent): void {
    this.showStatutList = !this.showStatutList;
    if (this.showStatutList) this.showPrioriteList = false;
    event.stopPropagation();
  }

  togglePrioriteList(event: MouseEvent): void {
    this.showPrioriteList = !this.showPrioriteList;
    if (this.showPrioriteList) this.showStatutList = false;
    event.stopPropagation();
  }

  selectStatut(statut: Statut): void {
    this.selectedStatut = statut;
    this.showStatutList = false;
    this.updateStatut();
  }

  selectPriorite(priorite: Priorite): void {
    this.selectedPriorite = priorite;
    this.showPrioriteList = false;
    this.updatePriorite();
  }

  zoomImage(): void {
    this.isImageZoomed = !this.isImageZoomed;
  }

  // Fermer les dropdowns en cliquant hors des composants
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInsideDropdown =
      target.closest('.statut-list') ||
      target.closest('.priorite-list') ||
      target.closest('.categorie-list') ||
      target.closest('.categorie-badge') ||
      target.closest('.statut-priorite-container');

    if (!isInsideDropdown) {
      this.showStatutList = false;
      this.showPrioriteList = false;
      this.showCategorieList = false;
    }
  }
}
