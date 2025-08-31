import { Component, OnInit } from '@angular/core';
import { Reclamation } from 'src/app/models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { CategorieService } from '../service/categorie.service';
import { Statut } from '../models/Statut';
import { Priorite } from '../models/Priorite';
import { Categorie } from '../models/Categorie';

@Component({
  selector: 'app-reclamtion-backoffice',
  templateUrl: './reclamtion-backoffice.component.html',
  styleUrls: ['./reclamtion-backoffice.component.css']
})
export class ReclamtionBackofficeComponent implements OnInit {

  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];
  categories: Categorie[] = [];

  // Filter properties
  filterRef: string = '';
  filterCategory: string = '';
  filterStatus: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  // Pagination
  pageSize = 7;
  currentPage = 1;

  // Status options for filter
  statusOptions = Object.values(Statut);

  constructor(
    private reclamationService: ReclamationService,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.getAllReclamations();
    this.getAllCategories();
  }

  getAllReclamations(): void {
    this.reclamationService.getAllReclamations().subscribe(
      (data: Reclamation[]) => {
        // Sort by priority: Élevé > Moyenne > Faible
        this.reclamations = data.sort((a, b) => {
          const priorityOrder = { 'Élevé': 0, 'Moyenne': 1, 'Faible': 2 };
          return priorityOrder[a.priorite] - priorityOrder[b.priorite];
        });
        this.applyFilters();
        this.currentPage = 1; // reset to first page when data is loaded/refreshed
      },
      (error) => {
        console.error('Error fetching reclamations:', error);
      }
    );
  }

  getAllCategories(): void {
    this.categorieService.getAllCategories().subscribe(
      (data: Categorie[]) => {
        this.categories = data;
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  // Apply all filters
  applyFilters(): void {
    this.filteredReclamations = this.reclamations.filter(reclamation => {
      // Filter by reference
      if (this.filterRef && !reclamation.ref?.toLowerCase().includes(this.filterRef.toLowerCase())) {
        return false;
      }

      // Filter by category
      if (this.filterCategory && reclamation.categorie?.nomCategorie !== this.filterCategory) {
        return false;
      }

      // Filter by status
      if (this.filterStatus && reclamation.statut !== this.filterStatus) {
        return false;
      }

      // Filter by date range
      if (this.filterStartDate || this.filterEndDate) {
        if (!reclamation.createdDate) {
          return false; // Skip reclamations without dates
        }
        const reclamationDate = new Date(reclamation.createdDate);

        if (this.filterStartDate) {
          const startDate = new Date(this.filterStartDate);
          if (reclamationDate < startDate) {
            return false;
          }
        }

        if (this.filterEndDate) {
          const endDate = new Date(this.filterEndDate);
          endDate.setHours(23, 59, 59, 999); // Set to end of day
          if (reclamationDate > endDate) {
            return false;
          }
        }
      }

      return true;
    });

    this.currentPage = 1; // Reset to first page when filters are applied
  }

  // Clear all filters
  clearFilters(): void {
    this.filterRef = '';
    this.filterCategory = '';
    this.filterStatus = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.applyFilters();
  }

  // Pagination getter: les reclamations affichées sur la page courante
  get pagedReclamations(): Reclamation[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredReclamations.slice(start, start + this.pageSize);
  }

  // Nombre total de pages
  get totalPages(): number {
    return Math.ceil(this.filteredReclamations.length / this.pageSize);
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

  // Helper methods to get user info
  getUserFullName(reclamation: Reclamation): string {
    return `${reclamation.user?.firstname || 'Unknown'} ${reclamation.user?.lastname || 'Unknown'}`;
  }

  getUserEmail(reclamation: Reclamation): string {
    return reclamation.user?.email || 'No email provided';
  }

  // Helper method to get reference
  getReclamationRef(reclamation: Reclamation): string {
    return reclamation.ref || 'N/A';
  }
}
