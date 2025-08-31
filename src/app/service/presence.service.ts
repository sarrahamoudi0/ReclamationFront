import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PresenceRequest {
  userId: string;
  date: string;
  status: PresenceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface PresenceResponse {
  id: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  date: string;
  status: PresenceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  expectedCheckInTime: string;
  lateMinutes?: number;
  notes?: string;
  markedByFirstName?: string;
  markedByLastName?: string;
  createdAt: string;
  updatedAt: string;
  isManualEntry: boolean;
}

export interface PresenceStatisticsResponse {
  userId: string;
  userFirstName: string;
  userLastName: string;
  statusCounts: { [key in PresenceStatus]: number };
  totalDays: number;
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
}

export enum PresenceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  LEAVE = 'LEAVE'
}

export interface PresencePage {
  content: PresenceResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private apiUrl = `${environment.apiUrl}/presence`;

  constructor(private http: HttpClient) { }

  // Mark presence for a user (Admin only)
  markPresence(request: PresenceRequest): Observable<PresenceResponse> {
    return this.http.post<PresenceResponse>(this.apiUrl, request);
  }

  // Update existing presence (Admin only)
  updatePresence(presenceId: string, request: PresenceRequest): Observable<PresenceResponse> {
    return this.http.put<PresenceResponse>(`${this.apiUrl}/${presenceId}`, request);
  }

  // Get presence by ID
  getPresenceById(presenceId: string): Observable<PresenceResponse> {
    return this.http.get<PresenceResponse>(`${this.apiUrl}/${presenceId}`);
  }

  // Get all presences for a user
  getUserPresences(userId: string, page: number = 0, size: number = 10): Observable<PresencePage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PresencePage>(`${this.apiUrl}/user/${userId}`, { params });
  }

  // Get presences for a specific date
  getPresencesByDate(date: string): Observable<PresenceResponse[]> {
    return this.http.get<PresenceResponse[]>(`${this.apiUrl}/date/${date}`);
  }

  // Get presences by status for a date
  getPresencesByDateAndStatus(date: string, status: PresenceStatus): Observable<PresenceResponse[]> {
    return this.http.get<PresenceResponse[]>(`${this.apiUrl}/date/${date}/status/${status}`);
  }

  // Get agents without presence for a date (Admin only)
  getAgentsWithoutPresence(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/missing/${date}`);
  }

  // Mark multiple presences (bulk operation - Admin only)
  markMultiplePresences(requests: PresenceRequest[]): Observable<PresenceResponse[]> {
    return this.http.post<PresenceResponse[]>(`${this.apiUrl}/bulk`, requests);
  }

  // Get presence statistics for a user
  getPresenceStatistics(userId: string, startDate: string, endDate: string): Observable<PresenceStatisticsResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<PresenceStatisticsResponse>(`${this.apiUrl}/statistics/${userId}`, { params });
  }

  // Delete presence (Admin only)
  deletePresence(presenceId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${presenceId}`);
  }

  // Get current user's presences
  getMyPresences(page: number = 0, size: number = 10): Observable<PresencePage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PresencePage>(`${this.apiUrl}/my-presences`, { params });
  }

  // Get current user's presence statistics
  getMyPresenceStatistics(startDate: string, endDate: string): Observable<PresenceStatisticsResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<PresenceStatisticsResponse>(`${this.apiUrl}/my-statistics`, { params });
  }

  // Helper methods for enum display
  getPresenceStatusLabel(status: PresenceStatus): string {
    const labels: { [key in PresenceStatus]: string } = {
      [PresenceStatus.PRESENT]: 'Présent',
      [PresenceStatus.ABSENT]: 'Absent',
      [PresenceStatus.LATE]: 'En retard',
      [PresenceStatus.HALF_DAY]: 'Demi-journée',
      [PresenceStatus.LEAVE]: 'Congé'
    };
    return labels[status] || status;
  }

  getPresenceStatusClass(status: PresenceStatus): string {
    const classes: { [key in PresenceStatus]: string } = {
      [PresenceStatus.PRESENT]: 'badge bg-success',
      [PresenceStatus.ABSENT]: 'badge bg-danger',
      [PresenceStatus.LATE]: 'badge bg-warning',
      [PresenceStatus.HALF_DAY]: 'badge bg-info',
      [PresenceStatus.LEAVE]: 'badge bg-secondary'
    };
    return classes[status] || 'badge bg-secondary';
  }
}






