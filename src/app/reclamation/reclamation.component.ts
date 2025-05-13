import { Component, OnInit } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { Router } from '@angular/router';
import { Statut } from 'src/app/models/Statut';
import { Priorite } from '../models/Priorite';
import { Categorie } from '../models/Categorie';
import { SousCategorie } from '../models/SousCategorie';  // Assurez-vous d'importer SousCategorie
import { CategorieService } from '../service/categorie.service';

@Component({
  selector: 'app-reclamation',
  templateUrl: './reclamation.component.html',
  styleUrls: ['./reclamation.component.css']
})
export class ReclamationComponent implements OnInit {

  reclamations: Reclamation[] = [];
  selectedFile: File | null = null;

  categories: Categorie[] = [];
  selectedCategory: Categorie = { idCategorie: "", nomCategorie: '', sousCategories: [] };
  selectedSubCategory: SousCategorie | null = null;  // Utilisation de SousCategorie

  newReclamation: Reclamation = {
    idReclamation: "",
    titre: "",
    description: "",
    image_reclamation: null,
    createdDate: null,
    statut: Statut.Nouveau,
    priorite: Priorite.Faible,
    categorie: { idCategorie: "", nomCategorie: '', sousCategories: [] },
    sousCategorie: { idSousCategorie: "", nomSousCategorie: '', categorieParentId: "" }  // Utilisation de SousCategorie
  };

  constructor(private reclamationService: ReclamationService,
              private categorieService: CategorieService,
              private router: Router) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categorieService.getAllCategoriesWithSubcategories().subscribe((categories: Categorie[]) => {
      this.categories = categories;
    });
  }

  onCategoryChange(category: Categorie): void {
    if (category) {
      this.selectedCategory = category;
      this.selectedSubCategory = null;  // Réinitialisation de la sous-catégorie
    }
  }

  onSubCategoryChange(subCategory: SousCategorie | null): void {
    this.selectedSubCategory = subCategory;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  submitReclamation(): void {
    const formData = new FormData();
    formData.append('titre', this.newReclamation.titre);
    formData.append('description', this.newReclamation.description);

    if (this.selectedCategory && this.selectedCategory.idCategorie) {
      formData.append('idCategorie', this.selectedCategory.idCategorie);
    }

    if (this.selectedSubCategory && this.selectedSubCategory.idSousCategorie) {
      formData.append('idSousCategorie', this.selectedSubCategory.idSousCategorie);
    }

    if (this.selectedFile) {
      formData.append('image_reclamation', this.selectedFile, this.selectedFile.name);
    }

    // Log FormData content
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    // Envoi de la réclamation
    this.reclamationService.addReclamation(formData).subscribe({
      next: (res) => {
        console.log('Réclamation envoyée avec succès :', res);
        this.router.navigate(['/myreclamation']);
      },
      error: (err) => {
        console.error('Erreur lors de l’envoi de la réclamation :', err);
        alert("Une erreur s'est produite. Veuillez réessayer.");
      }
    });
  }
}
