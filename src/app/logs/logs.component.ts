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
  filteredLogs: Logs[] = [];
  loading = false;
  errorMessage = '';

  currentLogType: 'auth' | 'reclamation' = 'auth';

  // Filter properties
  filterEmail: string = '';
  filterReclamationId: string = '';
  filterAction: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  pageSize = 5;
  currentPage = 1;

  // Action options for filter (common actions in logs)
  actionOptions: string[] = [];

  constructor(private LogsService: LogsService) {}

  ngOnInit(): void {
    this.fetchLogs();
  }

  fetchLogs(): void {
    this.loading = true;
    this.errorMessage = '';
    const obs = this.currentLogType === 'auth'
      ? this.LogsService.getAllLogs()
      : this.LogsService.getReclamationLogs();
    obs.subscribe({
      next: (data) => {
        this.logs = data;
        this.extractActionOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des logs.';
        console.error(error);
        this.loading = false;
      }
    });
  }

  // Extract unique action types for filter dropdown
  extractActionOptions(): void {
    const actions = [...new Set(this.logs.map(log => log.action))];
    this.actionOptions = actions.sort();
  }

  // Apply all filters
  applyFilters(): void {
    this.filteredLogs = this.logs.filter(log => {
      // Filter by email
      if (this.filterEmail && !log.agentEmail.toLowerCase().includes(this.filterEmail.toLowerCase())) {
        return false;
      }

      // Filter by reclamation ID (only for reclamation logs)
      if (this.currentLogType === 'reclamation' && this.filterReclamationId) {
        const reclamationId = this.getReclamationId(log.details);
        if (!reclamationId || !reclamationId.toLowerCase().includes(this.filterReclamationId.toLowerCase())) {
          return false;
        }
      }

      // Filter by action
      if (this.filterAction && log.action !== this.filterAction) {
        return false;
      }

      // Filter by date range
      if (this.filterStartDate || this.filterEndDate) {
        if (!log.timestamp) {
          return false; // Skip logs without timestamp
        }
        const logDate = new Date(log.timestamp);

        if (this.filterStartDate) {
          const startDate = new Date(this.filterStartDate);
          if (logDate < startDate) {
            return false;
          }
        }

        if (this.filterEndDate) {
          const endDate = new Date(this.filterEndDate);
          endDate.setHours(23, 59, 59, 999); // Set to end of day
          if (logDate > endDate) {
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
    this.filterEmail = '';
    this.filterReclamationId = '';
    this.filterAction = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.applyFilters();
  }

  get paginatedLogs(): Logs[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLogs.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  switchLogType(type: 'auth' | 'reclamation'): void {
    if (this.currentLogType !== type) {
      this.currentLogType = type;
      this.clearFilters(); // Clear filters when switching log types
      this.fetchLogs();
    }
  }

  // Extracts the reclamation id from the details string (assumes 'Réclamation ID: <id>' in details)
  getReclamationId(details: string): string | null {
    const match = details.match(/Réclamation ID: (\w+)/);
    return match ? match[1] : null;
  }

  // Returns the details string with the word 'reclamation' replaced by a link to the reclamation if in reclamation logs
  getDetailsWithLink(details: string): string {
    const regex = /Réclamation ID: (\w+)/;
    const match = details.match(regex);

    let textWithoutId = details.replace(regex, '').trim();

    if (match) {
      const id = match[1];
      return `${textWithoutId} <a href="/reclamationadmin/${id}" class="log-link">Voir réclamation</a>`;
    } else {
      return details;
    }
  }

  getCleanDetails(details: string): string {
    // On enlève la partie ID, mais aussi tout ce qui suit (par exemple si 'par John aaa')
    return details.replace(/Réclamation ID: \w+.*?(?=Voir réclamation|$)/, '').trim();
  }
}
