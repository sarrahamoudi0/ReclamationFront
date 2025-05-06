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

  constructor(private reclamationService: ReclamationService) {}

  ngOnInit(): void {
    this.getAllReclamations();
  }

  getAllReclamations(): void {
    this.reclamationService.getAllReclamations().subscribe(
      (data: Reclamation[]) => {
        this.reclamations = data;
      },
      (error) => {
        console.error('Error fetching reclamations:', error);
      }
    );
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
      hour12: false // Use 24-hour time format
    };

    return formattedDate.toLocaleString('en-GB', options);  // Use en-GB locale for correct month abbreviations (e.g., "Oct")
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
    // Show confirmation dialog before deletion
    const confirmDelete = confirm('Are you sure you want to delete this reclamation?');
    if (confirmDelete) {
      this.reclamationService.deleteReclamation(reclamation).subscribe(
        () => {
          console.log('Reclamation deleted');
          this.getAllReclamations(); // Re-fetch the list after deletion
        },
        (error) => {
          console.error('Error deleting reclamation:', error);
        }
      );
    }
  }

  // Safe access to user properties (with optional chaining)
  getUserFullName(reclamation: Reclamation): string {
    return `${reclamation.user?.firstname || 'Unknown'} ${reclamation.user?.lastname || 'Unknown'}`;
  }

  getUserEmail(reclamation: Reclamation): string {
    return reclamation.user?.email || 'No email provided';
  }
}
