import { Component } from '@angular/core';
import { Logs } from '../models/logs';
import { LogsService } from '../service/logs.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent {
  logs: Logs[] = [];
  loading = false;
  errorMessage = '';

  pageSize = 5;
  currentPage = 1;

  get paginatedLogs(): Logs[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.logs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.logs.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  constructor(private LogsService: LogsService) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.loading = true;
    this.LogsService.getAllLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des logs.';
        console.error(error);
        this.loading = false;
      }
    });
  }

}
