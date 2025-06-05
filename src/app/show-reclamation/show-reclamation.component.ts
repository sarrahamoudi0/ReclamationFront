import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { ActivatedRoute } from '@angular/router';
import { Statut } from '../models/Statut';
import { Priorite } from '../models/Priorite';
import { Router } from '@angular/router';
import { CategorieService } from '../service/categorie.service';
import { Categorie } from '../models/Categorie';
import { Commentaire } from '../models/Commentaire';
import { CommentaireService } from '../service/commentaire.service';

@Component({
  selector: 'app-show-reclamation',
  templateUrl: './show-reclamation.component.html',
  styleUrls: ['./show-reclamation.component.css']
})
export class ShowReclamationComponent implements OnInit {
  @ViewChild('commentsContainer') private commentsContainer!: ElementRef;

  reclamation!: Reclamation;
  reclamations: Reclamation[] = [];
  isImageZoomed = false; 
  categories: Categorie[] = []; 
  newCommentContent: string = '';
commentaires: Commentaire[] = [];
showCommentPopup = false;

 

  selectedFile: File | null = null;

  // Partial object for updating reclamation
  reclamationToUpdate: Partial<Reclamation> = {
    idReclamation: "", 
    titre: '',
    description: '',
    image_reclamation: null,
    url: '',  // To store the image preview URL
    createdDate: new Date(),
  };

  isPopupUpdateVisible: boolean = false;
  currentUserId: string = localStorage.getItem('userId') || '';

  constructor(
    private reclamationService: ReclamationService,      private commentaireService: CommentaireService,
    private categorieService: CategorieService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idReclamation = params.get('id');
      if (idReclamation) {
        this.getReclamation(idReclamation); 
        this.loadCommentaires(idReclamation);

      } else {
        console.error('ID de réclamation invalide :', idReclamation);
      }
    });
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const element = this.commentsContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

getReclamation(idReclamation: string): void {
  this.reclamationService.getReclamationById(idReclamation).subscribe(
    (reclamation: Reclamation) => {
      console.log('Reclamation fetched:', reclamation);
      this.reclamation = reclamation;
      if (this.reclamation.categorie) {
        console.log('Category:', this.reclamation.categorie.nomCategorie);
        console.log('Subcategories:', this.reclamation.categorie.sousCategories);
      }
    },
    (error) => {
      console.error('Error fetching reclamation:', error);
    }
  );
}


  loadCategories(): void {
  this.categorieService.getAllCategoriesWithSubcategories().subscribe((categories: Categorie[]) => {
    console.log('Categories with subcategories:', categories);  // Log the categories to ensure subcategories are populated
    this.categories = categories;
  });
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
    
    if (r.image_reclamation) {
      const base64Image = 'data:image/jpeg;base64,' + r.image_reclamation;
      this.reclamationToUpdate.url = base64Image; // Set the URL for the preview image
    }
    
    this.isPopupUpdateVisible = true;
  }

  closePopupUpdate(): void {
    this.isPopupUpdateVisible = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.reclamationToUpdate.image_reclamation = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.reclamationToUpdate.url = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateReclamation(): void {
    const formData = new FormData();
    
    formData.append('idReclamation', this.reclamationToUpdate.idReclamation || '');
    formData.append('titre', this.reclamationToUpdate.titre || '');
    formData.append('description', this.reclamationToUpdate.description || '');
    
    if (this.reclamationToUpdate.image_reclamation) {
      formData.append('image_reclamation', this.reclamationToUpdate.image_reclamation);
    }

    this.reclamationService.updateReclamation(formData).subscribe(
      (updatedReclamation: Reclamation) => {
        console.log('Réclamation mise à jour avec succès :', updatedReclamation);
        this.closePopupUpdate();
        this.getReclamation(updatedReclamation.idReclamation || '');
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
 
  loadCommentaires(idReclamation: string): void {
    this.commentaireService.getCommentairesByReclamation(idReclamation).subscribe({
      next: (comments) => {
        this.commentaires = comments;
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (error) => console.error('Erreur chargement commentaires:', error)
    });
  }
  
  addComment(): void {
    if (!this.newCommentContent.trim() || !this.reclamation?.idReclamation) return;
  
    this.commentaireService.addComment(this.reclamation.idReclamation, this.newCommentContent).subscribe({
      next: (commentaire) => {
        this.commentaires.push(commentaire);
        this.newCommentContent = '';
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (error) => console.error('Erreur ajout commentaire:', error)
    });
  }
  
  getUserImage(comment: any): string {
    return comment.user?.image
      ? 'data:image/jpeg;base64,' + comment.user.image
      : 'assets/img/default-avatar.png';
  }
  
  
}