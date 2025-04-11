import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categorie } from '../models/Categorie';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {

  private apiUrl = 'http://localhost:8083/categorie';

  constructor(private http: HttpClient) { } 

  addCategorie(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(`${this.apiUrl}/addCategorie`, categorie, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    });
  }

  getAllCategorie(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/getAllCategorie`);

  }

  deleteReclamation(categorie: Categorie): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${categorie.idCategorie}`);
  }

  updateReclamation(updatedCategorie: Categorie): Observable<Categorie> {
    const url = `${this.apiUrl}/updateReclamation`;
    return this.http.put<Categorie>(url, updatedCategorie);
  }}
