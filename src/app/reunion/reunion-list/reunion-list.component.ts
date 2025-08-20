import { Component, OnInit } from '@angular/core';
import { ReunionService, ReunionResponse, ReunionStatut, ReunionType } from '../../service/reunion.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reunion-list',
  templateUrl: './reunion-list.component.html',
  styleUrls: ['./reunion-list.component.css']
})
export class ReunionListComponent implements OnInit {
  reunions: ReunionResponse[] = [];
  loading = false;
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  // Filters
  selectedStatus: ReunionStatut | '' = '';
  selectedType: ReunionType | '' = '';
  searchTerm = '';
  
  // Enums for template
  reunionStatuts = Object.values(ReunionStatut);
  reunionTypes = Object.values(ReunionType);

  constructor(
    private reunionService: ReunionService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadReunions();
  }

  loadReunions(): void {
    this.loading = true;
    this.reunionService.getAllReunions(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.reunions = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des réunions:', error);
          this.toastr.error('Erreur lors du chargement des réunions');
          this.loading = false;
        }
      });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReunions();
  }

  onStatusFilterChange(): void {
    this.currentPage = 0;
    this.loadReunions();
  }

  onTypeFilterChange(): void {
    this.currentPage = 0;
    this.loadReunions();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadReunions();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedType = '';
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadReunions();
  }

  createReunion(): void {
    this.router.navigate(['/reunions/create']);
  }

  editReunion(reunion: ReunionResponse): void {
    this.router.navigate(['/reunions/edit', reunion.id]);
  }

  viewReunion(reunion: ReunionResponse): void {
    this.router.navigate(['/reunions/view', reunion.id]);
  }

  changeStatus(reunion: ReunionResponse, newStatus: ReunionStatut): void {
    this.reunionService.changeReunionStatus(reunion.id, newStatus)
      .subscribe({
        next: (updatedReunion) => {
          const index = this.reunions.findIndex(r => r.id === reunion.id);
          if (index !== -1) {
            this.reunions[index] = updatedReunion;
          }
          this.toastr.success('Statut de la réunion mis à jour avec succès');
        },
        error: (error) => {
          console.error('Erreur lors du changement de statut:', error);
          this.toastr.error('Erreur lors du changement de statut');
        }
      });
  }

  cancelReunion(reunion: ReunionResponse): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réunion ?')) {
      this.reunionService.cancelReunion(reunion.id)
        .subscribe({
          next: (updatedReunion) => {
            const index = this.reunions.findIndex(r => r.id === reunion.id);
            if (index !== -1) {
              this.reunions[index] = updatedReunion;
            }
            this.toastr.success('Réunion annulée avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de l\'annulation:', error);
            this.toastr.error('Erreur lors de l\'annulation');
          }
        });
    }
  }

  deleteReunion(reunion: ReunionResponse): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réunion ? Cette action est irréversible.')) {
      this.reunionService.deleteReunion(reunion.id)
        .subscribe({
          next: () => {
            this.reunions = this.reunions.filter(r => r.id !== reunion.id);
            this.toastr.success('Réunion supprimée avec succès');
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.toastr.error('Erreur lors de la suppression');
          }
        });
    }
  }

  getStatusClass(statut: ReunionStatut): string {
    return this.reunionService.getReunionStatutClass(statut);
  }

  getStatusLabel(statut: ReunionStatut): string {
    return this.reunionService.getReunionStatutLabel(statut);
  }

  getTypeLabel(type: ReunionType): string {
    return this.reunionService.getReunionTypeLabel(type);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  isUpcoming(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  getUpcomingCount(): number {
    return this.reunions.filter(r => this.isUpcoming(r.dateDebut)).length;
  }

  getActiveCount(): number {
    return this.reunions.filter(r => r.statut === ReunionStatut.EN_COURS).length;
  }

  getCompletedCount(): number {
    return this.reunions.filter(r => r.statut === ReunionStatut.TERMINEE).length;
  }
} 