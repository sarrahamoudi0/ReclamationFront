import { Component, OnInit, HostListener } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Statut } from '../models/Statut';

@Component({
  selector: 'app-show-admin-reclamation',
  templateUrl: './show-admin-reclamation.component.html',
  styleUrls: ['./show-admin-reclamation.component.css']
})
export class ShowAdminReclamationComponent implements OnInit {
  reclamation!: Reclamation;
  isImageZoomed = false;
  statutValues: Statut[] = Object.values(Statut);
  selectedStatut: Statut = Statut.Nouveau;
  showStatutList = false;
  statuts: Statut[] = this.statutValues;

  constructor(
    private reclamationService: ReclamationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idReclamation = params.get('id');
      if (idReclamation) {
        this.getReclamation(idReclamation);
      }
    });
  }

  getReclamation(idReclamation: string): void {
    this.reclamationService.getReclamationById(idReclamation).subscribe({
      next: (reclamation) => {
        this.reclamation = reclamation;
        this.selectedStatut = reclamation.statut as Statut;
      },
      error: (error) => console.error('Erreur de récupération:', error)
    });
  }

  getStatutClass(statut: Statut) {
    return {
      'statut-nouveau': statut === Statut.Nouveau,
      'statut-en-cours': statut === Statut.Encours,
      'statut-escalé': statut === Statut.Escale,
      'statut-resolu': statut === Statut.Résolu,
    };
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

  toggleStatutList() {
    this.showStatutList = !this.showStatutList;
  }

  selectStatut(statut: Statut) {
    this.selectedStatut = statut;
    this.showStatutList = false;           // Hide the list after selection
    this.updateStatut();                   // Update the statut
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const statutElement = document.getElementById('statut-container');
    if (statutElement && !statutElement.contains(event.target as Node)) {
      this.showStatutList = false;
    }
  }
}
