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
  categorieName: string = ''; // Pour le champ de saisie
  isModalOpen: boolean = false;
  editMode: boolean = false;
  currentCategorie: Categorie = { nomCategorie: '' }; // Utilisé pour la modification

  constructor(private categorieService: CategorieService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Erreur chargement catégories', err)
    });
  }

  openModal(editing: boolean, categorie?: Categorie): void {
    this.isModalOpen = true;
    this.editMode = editing;

    if (editing && categorie) {
      this.currentCategorie = { ...categorie };
      this.categorieName = categorie.nomCategorie;
    } else {
      this.currentCategorie = { nomCategorie: '' };
      this.categorieName = '';
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editMode = false;
    this.currentCategorie = { nomCategorie: '' };
    this.categorieName = '';
  }

  addCategorie(): void {
    const trimmedName = this.categorieName.trim();
    if (!trimmedName) return;

    const newCat: Categorie = { nomCategorie: trimmedName };

    this.categorieService.addCategorie(newCat).subscribe({
      next: (categorie) => {
        this.categories.push(categorie);
        this.closeModal();
      },
      error: (err) => console.error('Erreur ajout catégorie', err)
    });
  }

  editCategorie(categorie: Categorie): void {
    this.openModal(true, categorie);
  }

  updateCategorie(): void {
    const trimmedName = this.categorieName.trim();
    if (!trimmedName || !this.currentCategorie.idCategorie) {
      alert('Erreur : nom vide ou ID manquant.');
      return;
    }
  
    const updatedCat: Categorie = {
      idCategorie: this.currentCategorie.idCategorie,
      nomCategorie: trimmedName
    };
  
    this.categorieService.updateCategorie(updatedCat).subscribe({
      next: (categorie) => {
        this.categories = this.categories.map(cat =>
          cat.idCategorie === categorie.idCategorie ? categorie : cat
        );
        this.closeModal(); // Ferme le modal sans message
      },
      error: (err) => {
        console.error('Erreur mise à jour', err);
        alert('Erreur lors de la mise à jour.');
      }
    });
  }
  

  deleteCategorie(idCategorie?: string): void {
    if (idCategorie) {
      this.categorieService.deleteCategorie(idCategorie).subscribe({
        next: () => {
          this.categories = this.categories.filter(cat => cat.idCategorie !== idCategorie);
        },
        error: (err) => console.error('Erreur suppression catégorie', err)
      });
    }
  }
}
