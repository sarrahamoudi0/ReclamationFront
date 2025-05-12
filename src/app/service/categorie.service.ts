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
    return this.http.post<Categorie>(`${this.apiUrl}/addCategorie`, categorie);
  }

  // Get all categories
  getAllCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/getAllCategorie`);
  }

  // Update a category
  updateCategorie(categorie: Categorie): Observable<Categorie> {
    const url = `${this.apiUrl}/updateCategorie`; // URL to the update endpoint
    return this.http.put<Categorie>(url, categorie); // Send the PUT request with the category data
  }
  
  // Delete a category by ID
  deleteCategorie(idCategorie: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove/${idCategorie}`);
  }

   ajouterSousCategorie(idCategorieParent: string, nomSousCategorie: string): Observable<any> {
    const url = `${this.apiUrl}/${idCategorieParent}/sous-categorie`;
    return this.http.post<any>(url, { nomSousCategorie });
  }
    
  }