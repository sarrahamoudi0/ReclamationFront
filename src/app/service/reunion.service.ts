import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateReunionRequest {
  titre: string;
  description: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  type: ReunionType;
  participantIds: string[];
  ordreDuJour?: string;
  notes?: string;
}

export interface UpdateReunionRequest {
  titre?: string;
  description?: string;
  lieu?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: ReunionStatut;
  type?: ReunionType;
  participantIds?: string[];
  ordreDuJour?: string;
  notes?: string;
}

export interface ReunionResponse {
  id: string;
  titre: string;
  description: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  statut: ReunionStatut;
  type: ReunionType;
  organisateur: UserInfo;
  participants: UserInfo[];
  createdDate: string;
  lastModifiedDate: string;
  ordreDuJour?: string;
  notes?: string;
  rappelEnvoye: boolean;
}

export interface UserInfo {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

export enum ReunionStatut {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
  REPORTEE = 'REPORTEE'
}

export enum ReunionType {
  REUNION_TRAVAIL = 'REUNION_TRAVAIL',
  FORMATION = 'FORMATION',
  REVUE_PERFORMANCE = 'REVUE_PERFORMANCE',
  BRAINSTORMING = 'BRAINSTORMING',
  REUNION_EQUIPE = 'REUNION_EQUIPE',
  AUTRE = 'AUTRE'
}

export interface ReunionPage {
  content: ReunionResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReunionService {
  private apiUrl = `${environment.apiUrl}/reunions`;

  constructor(private http: HttpClient) { }

  // Create a new reunion
  createReunion(request: CreateReunionRequest): Observable<ReunionResponse> {
    return this.http.post<ReunionResponse>(this.apiUrl, request);
  }

  // Update an existing reunion
  updateReunion(reunionId: string, request: UpdateReunionRequest): Observable<ReunionResponse> {
    return this.http.put<ReunionResponse>(`${this.apiUrl}/${reunionId}`, request);
  }

  // Get reunion by ID
  getReunionById(reunionId: string): Observable<ReunionResponse> {
    return this.http.get<ReunionResponse>(`${this.apiUrl}/${reunionId}`);
  }

  // Get all reunions with pagination and optional filters
  getAllReunions(page: number = 0, size: number = 10, status?: ReunionStatut | '', type?: ReunionType | '', search?: string): Observable<ReunionPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (status) {
      params = params.set('status', status);
    }
    
    if (type) {
      params = params.set('type', type);
    }
    
    if (search && search.trim() !== '') {
      params = params.set('search', search.trim());
    }
    
    return this.http.get<ReunionPage>(this.apiUrl, { params });
  }

  // Get reunions by organizer (admin)
  getReunionsByOrganizer(): Observable<ReunionResponse[]> {
    return this.http.get<ReunionResponse[]>(`${this.apiUrl}/organisateur`);
  }

  // Get reunions where user is participant
  getReunionsByParticipant(): Observable<ReunionResponse[]> {
    return this.http.get<ReunionResponse[]>(`${this.apiUrl}/participant`);
  }

  // Alias for getReunionsByParticipant - for better readability
  getMyReunions(): Observable<ReunionResponse[]> {
    return this.getReunionsByParticipant();
  }

  // Get upcoming reunions
  getUpcomingReunions(): Observable<ReunionResponse[]> {
    return this.http.get<ReunionResponse[]>(`${this.apiUrl}/upcoming`);
  }

  // Get reunions by status
  getReunionsByStatus(statut: ReunionStatut): Observable<ReunionResponse[]> {
    return this.http.get<ReunionResponse[]>(`${this.apiUrl}/status/${statut}`);
  }

  // Get reunions by type
  getReunionsByType(type: ReunionType): Observable<ReunionResponse[]> {
    return this.http.get<ReunionResponse[]>(`${this.apiUrl}/type/${type}`);
  }

  // Get reunions by date range
  getReunionsByDateRange(startDate: string, endDate: string): Observable<ReunionResponse[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<ReunionResponse[]>(`${this.apiUrl}/date-range`, { params });
  }

  // Change reunion status
  changeReunionStatus(reunionId: string, newStatus: ReunionStatut): Observable<ReunionResponse> {
    const params = new HttpParams().set('newStatus', newStatus);
    return this.http.patch<ReunionResponse>(`${this.apiUrl}/${reunionId}/status`, null, { params });
  }

  // Cancel reunion
  cancelReunion(reunionId: string): Observable<ReunionResponse> {
    return this.http.patch<ReunionResponse>(`${this.apiUrl}/${reunionId}/cancel`, null);
  }

  // Delete reunion
  deleteReunion(reunionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reunionId}`);
  }

  // Get available agents
  getAvailableAgents(): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(`${this.apiUrl}/agents`);
  }

  // Send reunion reminders
  sendReunionReminders(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reminders/send`, null);
  }

  // Helper methods for enum display
  getReunionStatutLabel(statut: ReunionStatut): string {
    const labels: { [key in ReunionStatut]: string } = {
      [ReunionStatut.PLANIFIEE]: 'Planifiée',
      [ReunionStatut.EN_COURS]: 'En cours',
      [ReunionStatut.TERMINEE]: 'Terminée',
      [ReunionStatut.ANNULEE]: 'Annulée',
      [ReunionStatut.REPORTEE]: 'Reportée'
    };
    return labels[statut] || statut;
  }

  getReunionTypeLabel(type: ReunionType): string {
    const labels: { [key in ReunionType]: string } = {
      [ReunionType.REUNION_TRAVAIL]: 'Réunion de travail',
      [ReunionType.FORMATION]: 'Formation',
      [ReunionType.REVUE_PERFORMANCE]: 'Revue de performance',
      [ReunionType.BRAINSTORMING]: 'Brainstorming',
      [ReunionType.REUNION_EQUIPE]: 'Réunion d\'équipe',
      [ReunionType.AUTRE]: 'Autre'
    };
    return labels[type] || type;
  }

  getReunionStatutClass(statut: ReunionStatut): string {
    const classes: { [key in ReunionStatut]: string } = {
      [ReunionStatut.PLANIFIEE]: 'badge bg-primary',
      [ReunionStatut.EN_COURS]: 'badge bg-warning',
      [ReunionStatut.TERMINEE]: 'badge bg-success',
      [ReunionStatut.ANNULEE]: 'badge bg-danger',
      [ReunionStatut.REPORTEE]: 'badge bg-info'
    };
    return classes[statut] || 'badge bg-secondary';
  }
} 