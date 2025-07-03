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

  currentLogType: 'auth' | 'reclamation' = 'auth';
  searchId: string = '';
  searchEmail: string = '';

  pageSize = 5;
  currentPage = 1;

  get filteredLogs(): Logs[] {
    let filtered = this.logs;
    
    if (this.currentLogType === 'reclamation' && this.searchId.trim()) {
      filtered = filtered.filter(log => {
        const id = this.getReclamationId(log.details);
        return id && id.toLowerCase().includes(this.searchId.toLowerCase());
      });
    }
    
    if (this.searchEmail.trim()) {
      filtered = filtered.filter(log => 
        log.agentEmail.toLowerCase().includes(this.searchEmail.toLowerCase())
      );
    }
    
    return filtered;
  }

  get paginatedLogs(): Logs[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLogs.length / this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page when searching
  }

  clearSearch(): void {
    this.searchId = '';
    this.currentPage = 1;
  }

  clearEmailSearch(): void {
    this.searchEmail = '';
    this.currentPage = 1;
  }

  clearAllSearches(): void {
    this.searchId = '';
    this.searchEmail = '';
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  switchLogType(type: 'auth' | 'reclamation'): void {
    if (this.currentLogType !== type) {
      this.currentLogType = type;
      this.currentPage = 1;
      this.fetchLogs();
    }
  }

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
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des logs.';
        console.error(error);
        this.loading = false;
      }
    });
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
