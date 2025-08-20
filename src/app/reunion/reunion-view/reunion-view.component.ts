import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReunionService, ReunionResponse, ReunionStatut } from '../../service/reunion.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reunion-view',
  templateUrl: './reunion-view.component.html',
  styleUrls: ['./reunion-view.component.css']
})
export class ReunionViewComponent implements OnInit, OnDestroy {
  reunion: ReunionResponse | null = null;
  loading = false;
  isAdmin = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private reunionService: ReunionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadReunion();
    this.checkUserRole();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReunion(): void {
    const reunionId = this.route.snapshot.paramMap.get('id');
    if (!reunionId) {
      this.toastr.error('ID de réunion manquant');
      this.router.navigate(['/reunions']);
      return;
    }

    this.loading = true;
    this.reunionService.getReunionById(reunionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reunion) => {
          this.reunion = reunion;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la réunion:', error);
          this.toastr.error('Erreur lors du chargement de la réunion');
          this.loading = false;
        }
      });
  }

  private checkUserRole(): void {
    // This would typically come from an auth service
    // For now, we'll assume admin if they can access the edit route
    this.isAdmin = true; // This should be determined by actual user role
  }

  editReunion(): void {
    if (this.reunion) {
      this.router.navigate(['/reunions/edit', this.reunion.id]);
    }
  }

  backToList(): void {
    this.router.navigate(['/reunions']);
  }

  getStatusClass(statut: ReunionStatut): string {
    return this.reunionService.getReunionStatutClass(statut);
  }

  getStatusLabel(statut: ReunionStatut): string {
    return this.reunionService.getReunionStatutLabel(statut);
  }

  getTypeLabel(type: any): string {
    return this.reunionService.getReunionTypeLabel(type);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  isUpcoming(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  isPast(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }
} 