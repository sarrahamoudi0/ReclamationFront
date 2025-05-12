import { Component, OnInit } from '@angular/core';
import { CategorieService } from '../service/categorie.service';
import { Categorie } from '../models/Categorie';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.css']
})
export class CategorieComponent implements OnInit {
  categories: Categorie[] = [];
  categorieName: string = '';
  sousCategorieName: string = '';

  // Modals état
  isModalOpen = false;
  editMode = false;
  isSubModalOpen = false;
  isViewModalOpen = false;

  // Sélections
  currentCategorie: Categorie = { idCategorie: '', nomCategorie: '', sousCategories: [] };
  selectedCategory?: Categorie;

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: data => this.categories = data,
      error: err => console.error('Erreur chargement catégories', err)
    });
  }

  // === Modal Catégorie ===
  openModal(editing: boolean, categorie?: Categorie): void {
    this.isModalOpen = true;
    this.editMode = editing;
    if (editing && categorie) {
      this.currentCategorie = { ...categorie };
      this.categorieName = categorie.nomCategorie;
    } else {
      this.currentCategorie = { idCategorie: '', nomCategorie: '', sousCategories: [] };
      this.categorieName = '';
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editMode = false;
    this.currentCategorie = { idCategorie: '', nomCategorie: '', sousCategories: [] };
    this.categorieName = '';
    this.sousCategorieName = '';
  }

  addCategorie(): void {
    const name = this.categorieName.trim();
    if (!name) return;
    const newCat: Categorie = { idCategorie: '', nomCategorie: name, sousCategories: [] };
    this.categorieService.addCategorie(newCat).subscribe({
      next: cat => {
        this.categories.push(cat);
        this.closeModal();
      }, error: err => console.error('Erreur ajout catégorie', err)
    });
  }

  editCategorie(categorie: Categorie): void {
    this.openModal(true, categorie);
  }

  updateCategorie(): void {
    const name = this.categorieName.trim();
    if (!name || !this.currentCategorie.idCategorie) {
      alert('Erreur : nom vide ou ID manquant.');
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
      }, error: err => console.error('Erreur mise à jour', err)
    });
  }

  deleteCategorie(idCategorie?: string): void {
    if (!idCategorie) return;
    this.categorieService.deleteCategorie(idCategorie).subscribe({
      next: () => this.categories = this.categories.filter(cat => cat.idCategorie !== idCategorie),
      error: err => console.error('Erreur suppression catégorie', err)
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
    if (!parentId || !name) return;
    this.categorieService.ajouterSousCategorie(parentId, name).subscribe({
      next: updatedCat => {
        this.categories = this.categories.map(cat =>
          cat.idCategorie === updatedCat.idCategorie ? updatedCat : cat
        );
        this.closeSubModal();
      }, error: err => console.error('Erreur ajout sous-catégorie', err)
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
}
