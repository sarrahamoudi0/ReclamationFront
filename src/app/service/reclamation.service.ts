import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reclamation } from '../models/Reclamation';
import { Statut } from '../models/Statut';

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

  updateReclamation(formData: FormData): Observable<Reclamation> {
    const url = `${this.apiUrl}/updateReclamation`;
    return this.http.put<Reclamation>(url, formData);
  }
  


  getReclamationById(idReclamation: string): Observable<Reclamation> {
    const url = `${this.apiUrl}/getReclamationById/${idReclamation}`;
    return this.http.get<Reclamation>(url);
  }
  
  updateReclamationStatut(id: string, statut: Statut): Observable<Reclamation> {
    // The request body will be in the format { statut: "Encours" }, etc.
    return this.http.put<Reclamation>(`${this.apiUrl}/updateReclamationStatut/${id}`, { statut });
  }

}
