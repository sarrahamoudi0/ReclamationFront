import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Logs } from '../models/logs';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private apiUrl = 'http://localhost:8083/logs';


  constructor(private http: HttpClient) { }

  getAllLogs(): Observable<Logs[]> {
    return this.http.get<Logs[]>(`${this.apiUrl}/getlogs/auth`);
  }

  getReclamationLogs(): Observable<Logs[]> {
    return this.http.get<Logs[]>(`${this.apiUrl}/getlogs/reclamations`);
  }


}
