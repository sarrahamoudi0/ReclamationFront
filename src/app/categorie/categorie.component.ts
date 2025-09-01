import { Component, OnInit } from '@angular/core';
import { CategorieService } from '../service/categorie.service';
import { Categorie } from '../models/Categorie';
import { ChangeDetectorRef } from '@angular/core';
import { SousCategorie } from '../models/SousCategorie';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.css']
})
export class CategorieComponent implements OnInit {
  categories: Categorie[] = [];
  categorieName: string = '';
  sousCategorieName: string = '';
  reclamations: Reclamation[] = [];

  // Filter properties
  searchTerm: string = '';
  selectedFilter: string = 'all'; // 'all', 'withSubcategories', 'withoutSubcategories'

  // Modals état
  isModalOpen = false;
  editMode = false;
  isSubModalOpen = false;
  isViewModalOpen = false;

  // Sélections
  currentCategorie: Categorie = { nomCategorie: '', sousCategories: [] };
  selectedCategory?: Categorie;

  constructor(
    private categorieService: CategorieService,
    private reclamationService: ReclamationService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadReclamations();
  }

  // Filter methods
  get filteredCategories(): Categorie[] {
    let filtered = this.categories;

    // Filter by search term
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(category =>
        category.nomCategorie.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by subcategory status
    switch (this.selectedFilter) {
      case 'withSubcategories':
        filtered = filtered.filter(category =>
          category.sousCategories && category.sousCategories.length > 0
        );
        break;
      case 'withoutSubcategories':
        filtered = filtered.filter(category =>
          !category.sousCategories || category.sousCategories.length === 0
        );
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    return filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedFilter = 'all';
  }

  // === Modal Catégorie ===
  openModal(editing: boolean, categorie?: Categorie): void {
    this.isModalOpen = true;
    this.editMode = editing;
    if (editing && categorie) {
      this.currentCategorie = { ...categorie };
      this.categorieName = categorie.nomCategorie;
    } else {
      this.currentCategorie = { nomCategorie: '', sousCategories: [] };
      this.categorieName = '';
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editMode = false;
    this.currentCategorie = { nomCategorie: '', sousCategories: [] };
    this.categorieName = '';
    this.sousCategorieName = '';
  }

  addCategorie(): void {
    const name = this.categorieName.trim();
    if (!name) {
      this.toastrService.error('Le nom de la catégorie ne peut pas être vide');
      return;
    }

    // Show confirmation dialog
    Swal.fire({
      title: 'Créer une nouvelle catégorie',
      text: `Êtes-vous sûr de vouloir créer la catégorie "${name}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, créer',
      cancelButtonText: 'Annuler',
      customClass: { popup: 'swal2-popup-custom' }
    }).then((result) => {
      if (result.isConfirmed) {
        const newCat: Categorie = { nomCategorie: name, sousCategories: [] };
        this.categorieService.addCategorie(newCat).subscribe({
          next: cat => {
            this.categories.push(cat);
            this.closeModal();
            this.toastrService.success('Catégorie ajoutée avec succès');
          },
          error: err => {
            console.error('Erreur ajout catégorie', err);
            this.toastrService.error('Erreur lors de l\'ajout de la catégorie');
          }
        });
      }
    });
  }

  editCategorie(categorie: Categorie): void {
    console.log('Editing category:', categorie);
    this.openModal(true, categorie);
  }

  updateCategorie(): void {
    const name = this.categorieName.trim();
    if (!name || !this.currentCategorie.idCategorie) {
      this.toastrService.error('Erreur : nom vide ou ID manquant.');
      return;
    }
    this.categorieService.updateCategorie({
      ...this.currentCategorie,
      nomCategorie: name
    }).subscribe({
      next: updated => {
        this.categories = this.categories.map(cat =>
          cat.idCategorie === updated.idCategorie ? updated : cat
        );
        this.closeModal();
        this.toastrService.success('Catégorie mise à jour avec succès');
      },
      error: err => {
        console.error('Erreur mise à jour', err);
        this.toastrService.error('Erreur lors de la mise à jour de la catégorie');
      }
    });
  }

  async deleteCategorie(idCategorie?: string): Promise<void> {
    if (!idCategorie) return;

    const isTopLevel = this.categories.some(cat => cat.idCategorie === idCategorie);
    if (!isTopLevel) {
      this.toastrService.error('Suppression invalide.');
      return;
    }

    const result = await Swal.fire({
      title: 'Supprimer la catégorie',
      text: 'Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      customClass: { popup: 'swal2-popup-custom' }
    });
    if (!result.isConfirmed) return;

    this.categorieService.deleteCategorie(idCategorie).subscribe({
      next: () => {
        this.categories = this.categories.filter(cat => cat.idCategorie !== idCategorie);
        this.toastrService.success('Catégorie supprimée avec succès');
      },
      error: err => {
        console.error('Erreur suppression catégorie', err);
        this.toastrService.error('Erreur lors de la suppression de la catégorie');
      }
    });
  }

  // === Modal Sous-catégorie ===
  openSubModal(category: Categorie, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedCategory = category;
    this.sousCategorieName = '';
    this.isSubModalOpen = true;
  }

  closeSubModal(): void {
    this.selectedCategory = undefined;
    this.sousCategorieName = '';
    this.isSubModalOpen = false;
  }

  confirmAddSubCategorie(): void {
    const parentId = this.selectedCategory?.idCategorie;
    const name = this.sousCategorieName.trim();
    if (!parentId || !name) {
      this.toastrService.error('Le nom de la sous-catégorie ne peut pas être vide');
      return;
    }

    this.categorieService.ajouterSousCategorie(parentId, name).subscribe({
      next: updatedCat => {
        this.categories = this.categories.map(cat =>
          cat.idCategorie === updatedCat.idCategorie ? updatedCat : cat
        );
        this.closeSubModal();
        this.toastrService.success('Sous-catégorie ajoutée avec succès');
      },
      error: err => {
        console.error('Erreur ajout sous-catégorie', err);
        this.toastrService.error('Erreur lors de l\'ajout de la sous-catégorie');
      }
    });
  }

  // === Modal Consultation Sous-catégories ===
  openViewModal(category: Categorie): void {
    this.selectedCategory = category;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.selectedCategory = undefined;
    this.isViewModalOpen = false;
  }

  onDeleteSousCategorie(category: Categorie | undefined, sousCategory: SousCategorie | undefined): void {
    if (category?.idCategorie && sousCategory?.idSousCategorie) {
      this.deleteSousCategorie(category.idCategorie, sousCategory.idSousCategorie);
    } else {
      console.warn('Invalid IDs for deletion. category or sousCategory ID is missing.');
    }
  }

  deleteSousCategorie(idParent: string, idSousCategorie: string): void {
    if (!idParent || !idSousCategorie) {
      this.toastrService.error('ID de catégorie ou de sous-catégorie invalide.');
      return;
    }

    this.categorieService.deleteSousCategorie(idParent, idSousCategorie)
      .subscribe({
        next: () => {
          this.toastrService.success('Sous-catégorie supprimée avec succès');
          // Optionally remove the subcategory from the UI without refreshing
          const category = this.categories.find(cat => cat.idCategorie === idParent);
          if (category) {
            category.sousCategories = category.sousCategories.filter(sous => sous.idSousCategorie !== idSousCategorie);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastrService.error('Erreur lors de la suppression de la sous-catégorie');
        }
      });
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe(
      (data) => {
        this.categories = data;
      },
      (error) => {
        console.error('Erreur de récupération des catégories:', error);
        this.toastrService.error('Erreur lors du chargement des catégories');
      }
    );
  }

  loadReclamations(): void {
    this.reclamationService.getAllReclamations().subscribe({
      next: (data) => (this.reclamations = data),
      error: (err) => console.error('Erreur récupération réclamations', err)
    });
  }

  // Vérifie si une catégorie est liée à au moins une réclamation
  isCategorieLinkedToReclamation(categorie: Categorie): boolean {
    if (!categorie.idCategorie) return false;
    return this.reclamations.some(
      (r) => r.categorie?.idCategorie === categorie.idCategorie
    );
  }

  // Get category statistics
  getCategoryStats(): { total: number; withSubcategories: number; totalSubcategories: number } {
    const total = this.categories.length;
    const withSubcategories = this.categories.filter(cat =>
      cat.sousCategories && cat.sousCategories.length > 0
    ).length;
    
    // Calculate total subcategories across all categories
    const totalSubcategories = this.categories.reduce((sum, cat) => {
      return sum + (cat.sousCategories ? cat.sousCategories.length : 0);
    }, 0);

    return { total, withSubcategories, totalSubcategories };
  }
}
