import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reclamation } from '../models/Reclamation';
import { Statut } from '../models/Statut';
import { Priorite } from '../models/Priorite';
import { ReclamationEvent } from '../models/EventType';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {

  private apiUrl = 'http://localhost:8083/project';

  constructor(private http: HttpClient) { } 

  addReclamation(formData: FormData): Observable<Reclamation> {
    return this.http.post<Reclamation>(`${this.apiUrl}/addReclamation`, formData);
  }


  

  getMyReclamation(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/getMyReclamations`);

  }

  getAllReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/getAllReclamations`);
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

  updateReclamationPriority(id: string, priority: Priorite): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}/priority?priority=${priority}`, {});
  }

    assignCategorieToReclamation(idReclamation: string, idCategorie: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idReclamation}/assign-categorie/${idCategorie}`, {});
  }

   assignOneCategorieToReclamation(idReclamation: string, idCategorie: string, idSousCategorie: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${idReclamation}/assign-categorie?idCategorie=${idCategorie}&idSousCategorie=${idSousCategorie}`, {});
  }

    updateCategorieToReclamation(idReclamation: string, idCategorie: string, idSousCategorie: string): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${idReclamation}/update-categorie`, null, {
      params: {
        idCategorie,
        idSousCategorie
      }
    });
  }

  getEventsForReclamation(idReclamation: string): Observable<ReclamationEvent[]> {
    return this.http.get<ReclamationEvent[]>(`${this.apiUrl}/reclamation/${idReclamation}/events`);
  }
}

