import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReunionService, ReunionResponse, ReunionStatut, ReunionType } from '../../service/reunion.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-reunion-list',
  templateUrl: './reunion-list.component.html',
  styleUrls: ['./reunion-list.component.css']
})
export class ReunionListComponent implements OnInit, OnDestroy {
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

  // Debounced search
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(
    private reunionService: ReunionService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Setup debounced search
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500), // Wait 500ms after user stops typing
      distinctUntilChanged() // Only emit if value has changed
    ).subscribe(() => {
      this.currentPage = 0; // Reset to first page when searching
      this.loadReunions();
    });

    this.loadReunions();
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadReunions(): void {
    this.loading = true;
    this.reunionService.getAllReunions(
      this.currentPage, 
      this.pageSize, 
      this.selectedStatus, 
      this.selectedType, 
      this.searchTerm
    )
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

  onSearchInputChange(): void {
    // Use debounced search to avoid too many API calls
    this.searchSubject.next(this.searchTerm);
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

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateOnly(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  isUpcoming(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  isCurrentlyActive(reunion: ReunionResponse): boolean {
    const now = new Date();
    const startTime = new Date(reunion.dateDebut);
    const endTime = new Date(reunion.dateFin);
    return now >= startTime && now <= endTime && reunion.statut === ReunionStatut.EN_COURS;
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

  getCancelledCount(): number {
    return this.reunions.filter(r => r.statut === ReunionStatut.ANNULEE).length;
  }

  getPostponedCount(): number {
    return this.reunions.filter(r => r.statut === ReunionStatut.REPORTEE).length;
  }

  // Enhanced statistics methods
  getOngoingReunions(): ReunionResponse[] {
    return this.reunions.filter(r => r.statut === ReunionStatut.EN_COURS);
  }

  getCompletedReunions(): ReunionResponse[] {
    return this.reunions.filter(r => r.statut === ReunionStatut.TERMINEE);
  }

  getAverageMeetingDuration(): string {
    const completedReunions = this.getCompletedReunions();
    if (completedReunions.length === 0) return '0 min';

    const totalDuration = completedReunions.reduce((total, reunion) => {
      const start = new Date(reunion.dateDebut);
      const end = new Date(reunion.dateFin);
      return total + (end.getTime() - start.getTime());
    }, 0);

    const averageMinutes = Math.round(totalDuration / (completedReunions.length * 60000));
    return `${averageMinutes} min`;
  }

  getLongestMeetingDuration(): string {
    const completedReunions = this.getCompletedReunions();
    if (completedReunions.length === 0) return '0 min';

    const longestDuration = Math.max(...completedReunions.map(reunion => {
      const start = new Date(reunion.dateDebut);
      const end = new Date(reunion.dateFin);
      return end.getTime() - start.getTime();
    }));

    const minutes = Math.round(longestDuration / 60000);
    return `${minutes} min`;
  }

  getNextMeeting(): ReunionResponse | null {
    const upcomingReunions = this.reunions.filter(r => this.isUpcoming(r.dateDebut));
    if (upcomingReunions.length === 0) return null;

    return upcomingReunions.reduce((next, current) => {
      const nextDate = new Date(next.dateDebut);
      const currentDate = new Date(current.dateDebut);
      return nextDate < currentDate ? next : current;
    });
  }

  getCurrentMeeting(): ReunionResponse | null {
    const activeReunions = this.getOngoingReunions();
    if (activeReunions.length === 0) return null;

    return activeReunions.reduce((current, next) => {
      const currentEnd = new Date(current.dateFin);
      const nextEnd = new Date(next.dateFin);
      return currentEnd < nextEnd ? current : next;
    });
  }

  getMeetingDuration(reunion: ReunionResponse): string {
    const start = new Date(reunion.dateDebut);
    const end = new Date(reunion.dateFin);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.round(durationMs / 60000);
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
  }

  getMeetingProgress(reunion: ReunionResponse | null): number {
    if (!reunion) return 0;
    
    const now = new Date();
    const start = new Date(reunion.dateDebut);
    const end = new Date(reunion.dateFin);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / totalDuration) * 100);
  }
} 