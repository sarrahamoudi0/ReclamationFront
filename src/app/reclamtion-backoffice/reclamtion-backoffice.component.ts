import { Component, OnInit } from '@angular/core';
import { Reclamation } from 'src/app/models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { Statut } from '../models/Statut';
import { Priorite } from '../models/Priorite';

@Component({
  selector: 'app-reclamtion-backoffice',
  templateUrl: './reclamtion-backoffice.component.html',
  styleUrls: ['./reclamtion-backoffice.component.css']
})
export class ReclamtionBackofficeComponent implements OnInit {

  reclamations: Reclamation[] = [];

  // Pagination
  pageSize = 7;
  currentPage = 1;

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit(): void {
    this.getAllReclamations();
  }

  getAllReclamations(): void {
    this.reclamationService.getAllReclamations().subscribe(
      (data: Reclamation[]) => {
        this.reclamations = data;
        this.currentPage = 1; // reset to first page when data is loaded/refreshed
      },
      (error) => {
        console.error('Error fetching reclamations:', error);
      }
    );
  }

  // Pagination getter : les reclamations affichées sur la page courante
  get pagedReclamations(): Reclamation[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reclamations.slice(start, start + this.pageSize);
  }

  // Nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.reclamations.length / this.pageSize);
  }

  // Changer de page
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  getFormattedDate(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';

    const formattedDate = new Date(date);

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    return formattedDate.toLocaleString('en-GB', options);
  }

  getStatutClass(statut: Statut): string {
    switch (statut) {
      case Statut.Nouveau:
        return 'badge-pending';
      case Statut.Encours:
        return 'badge-inprogress';
      case Statut.Escale:
        return 'badge-escalated';
      case Statut.Résolu:
        return 'badge-resolved';
      default:
        return 'badge-default';
    }
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

  deleteReclamation(reclamation: Reclamation): void {
    const confirmDelete = confirm('Are you sure you want to delete this reclamation?');
    if (confirmDelete) {
      this.reclamationService.deleteReclamation(reclamation).subscribe(
        () => {
          console.log('Reclamation deleted');
          this.getAllReclamations();
        },
        (error) => {
          console.error('Error deleting reclamation:', error);
        }
      );
    }
  }

  getUserFullName(reclamation: Reclamation): string {
    return `${reclamation.user?.firstname || 'Unknown'} ${reclamation.user?.lastname || 'Unknown'}`;
  }

  getUserEmail(reclamation: Reclamation): string {
    return reclamation.user?.email || 'No email provided';
  }
}