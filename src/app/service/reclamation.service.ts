import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reclamation } from '../models/Reclamation';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {

  private apiUrl = 'http://localhost:8083/project';

  constructor(private http: HttpClient) { } 

  addReclamation(formData: FormData): Observable<Reclamation> {
    return this.http.post<Reclamation>(`${this.apiUrl}/addReclamation`, formData);
  }

  getAllReclamation(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/getAllReclamation`);

  }

  deleteReclamation(reclamation: Reclamation): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${reclamation.idReclamation}`);
  }

  updateReclamation(updatedReclamation: Partial<Reclamation>): Observable<Reclamation> {
    const url = `${this.apiUrl}/updateReclamation`;
    return this.http.put<Reclamation>(url, updatedReclamation);
  }

  getReclamationById(idReclamation: string): Observable<Reclamation> {
    const url = `${this.apiUrl}/getReclamationById/${idReclamation}`;
    return this.http.get<Reclamation>(url);
  }
  


}
