import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commentaire } from '../models/Commentaire';

@Injectable({
  providedIn: 'root'
})
export class CommentaireService {

  
  private apiUrl = 'http://localhost:8083/commentaire';

  constructor(private http: HttpClient) { }

  // Ajouter un commentaire à une réclamation
  addComment(idReclamation: string, contenu: string): Observable<Commentaire> {
    const params = new HttpParams().set('contenu', contenu);
    return this.http.post<Commentaire>(`${this.apiUrl}/${idReclamation}`, null, { params });
  }



  // Récupérer la liste des commentaires d'une réclamation
  getCommentairesByReclamation(idReclamation: string): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/commentaire/${idReclamation}`);
  }

  // Mettre à jour un commentaire
  updateCommentaire(commentaire: Commentaire): Observable<Commentaire> {
    return this.http.put<Commentaire>(`${this.apiUrl}/updateCommentaire`, commentaire);
  }

  // Supprimer un commentaire par son id
  deleteCommentaire(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove/${id}`);
  }

  // Récupérer un commentaire par son id
  getCommentaireById(id: string): Observable<Commentaire> {
    return this.http.get<Commentaire>(`${this.apiUrl}/getCommentaireById/${id}`);
  }

  addCommentInterne(idReclamation: string, contenu: string): Observable<Commentaire> {
    const params = new HttpParams().set('contenu', contenu);
    return this.http.post<Commentaire>(`${this.apiUrl}/add/interne/${idReclamation}`, null, { params });
  }
  
  getCommentairesInternes(idReclamation: string): Observable<Commentaire[]> {
    return this.http.get<Commentaire[]>(`${this.apiUrl}/internes/${idReclamation}`);
  }
}
