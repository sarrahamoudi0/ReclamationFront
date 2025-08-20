import { Component, OnInit } from '@angular/core';
import { ReunionService, ReunionResponse, ReunionStatut, ReunionType } from '../../service/reunion.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reunion-agent',
  templateUrl: './reunion-agent.component.html',
  styleUrls: ['./reunion-agent.component.css']
})
export class ReunionAgentComponent implements OnInit {
  reunions: ReunionResponse[] = [];
  loading = false;
  
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
    this.loadMyReunions();
  }

  loadMyReunions(): void {
    this.loading = true;
    this.reunionService.getMyReunions()
      .subscribe({
        next: (reunions) => {
          this.reunions = reunions;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de vos réunions:', error);
          this.toastr.error('Erreur lors du chargement de vos réunions');
          this.loading = false;
        }
      });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedType = '';
    this.searchTerm = '';
    this.loadMyReunions();
  }

  private applyFilters(): void {
    let filteredReunions = [...this.reunions];
    
    if (this.selectedStatus) {
      filteredReunions = filteredReunions.filter(r => r.statut === this.selectedStatus);
    }
    
    if (this.selectedType) {
      filteredReunions = filteredReunions.filter(r => r.type === this.selectedType);
    }
    
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredReunions = filteredReunions.filter(r => 
        r.titre.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.lieu.toLowerCase().includes(searchLower)
      );
    }
    
    this.reunions = filteredReunions;
  }

  viewReunion(reunion: ReunionResponse): void {
    this.router.navigate(['/reunions/view', reunion.id]);
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

  getTotalCount(): number {
    return this.reunions.length;
  }
} 