import { Component, OnInit, HostListener } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Statut } from '../models/Statut';
import { Priorite } from '../models/Priorite';

@Component({
  selector: 'app-show-admin-reclamation',
  templateUrl: './show-admin-reclamation.component.html',
  styleUrls: ['./show-admin-reclamation.component.css']
})
export class ShowAdminReclamationComponent implements OnInit {
  reclamation!: Reclamation;
  isImageZoomed = false;

  // Statut handling
  statutValues: Statut[] = Object.values(Statut);
  selectedStatut: Statut = Statut.Nouveau;
  showStatutList = false;
  statuts: Statut[] = this.statutValues;

  // Priorité handling
  prioriteValues: Priorite[] = Object.values(Priorite);  // List of priorities
  selectedPriorite: Priorite = Priorite.Faible;
  showPrioriteList = false;

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
        this.selectedPriorite = reclamation.priorite as Priorite;
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

  toggleStatutList() {
    this.showStatutList = !this.showStatutList;
    if (this.showStatutList) {
      this.showPrioriteList = false; // Hide Priorité dropdown if Statut is visible
    }
  }

  togglePrioriteList() {
    this.showPrioriteList = !this.showPrioriteList;
    if (this.showPrioriteList) {
      this.showStatutList = false; // Hide Statut dropdown if Priorité is visible
    }
  }

  selectStatut(statut: Statut) {
    this.selectedStatut = statut;
    this.showStatutList = false;           // Hide the list after selection
    this.updateStatut();                   // Update the statut
  }

  selectPriorite(priorite: Priorite) {
    this.selectedPriorite = priorite;
    this.showPrioriteList = false;           // Hide the list after selection
    this.updatePriorite();                   // Update the priorite
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const statutElement = document.getElementById('statut-container');
    const prioriteElement = document.getElementById('priorite-container');
    
    if (statutElement && !statutElement.contains(event.target as Node)) {
      this.showStatutList = false;
    }
    
    if (prioriteElement && !prioriteElement.contains(event.target as Node)) {
      this.showPrioriteList = false;
    }
  }
}
