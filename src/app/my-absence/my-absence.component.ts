import { Component, OnInit } from '@angular/core';
import { PresenceService, PresencePage, PresenceStatus } from '../service/presence.service';

@Component({
  selector: 'app-my-absence',
  templateUrl: './my-absence.component.html',
  styleUrls: ['./my-absence.component.css']
})
export class MyAbsenceComponent implements OnInit {
  absences: PresencePage | null = null;
  currentPage = 0;
  pageSize = 10;
  loading = false;
  PresenceStatus = PresenceStatus;

  // Statistics
  totalPresences = 0;
  totalAbsences = 0;
  totalRetards = 0;
  tauxPresence = 0;

  
  scoreGlobal: number | undefined;

  constructor(private readonly presenceService: PresenceService) {}

  ngOnInit(): void {
    this.loadAbsences();
  }

  loadAbsences(): void {
    this.loading = true;
    this.presenceService.getMyPresences(this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.absences = data;
          this.calculateStatistics(data);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des absences:', error);
          this.loading = false;
        }
      });
  }

  private calculateStatistics(data: PresencePage): void {
    // Calculer le total des présences
    this.totalPresences = data.content.filter(p =>
      p.status === PresenceStatus.PRESENT
    ).length;

     this.totalRetards = data.content.filter(p =>
      p.status === PresenceStatus.LATE
    ).length;

    // Calculer le total des absences
    this.totalAbsences = data.content.filter(p =>
      p.status === PresenceStatus.ABSENT
    ).length;

    // Calculer le taux de présence
    const total = this.totalPresences + this.totalAbsences;
    this.tauxPresence = total > 0
      ? Math.round((this.totalPresences / total) * 100)
      : 0;

    // Calculer le score global (exemple de calcul)
    this.scoreGlobal = Math.min(100, Math.round(this.tauxPresence +
      (this.totalPresences > 0 ? 10 : 0) +
      (this.totalAbsences < 3 ? 10 : 0)));
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAbsences();
  }

  getStatusLabel(status: PresenceStatus): string {
    return this.presenceService.getPresenceStatusLabel(status);
  }

  getStatusClass(status: PresenceStatus): string {
    return this.presenceService.getPresenceStatusClass(status);
  }
}
