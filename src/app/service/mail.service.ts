import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mail } from '../models/mail';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  private apiUrl = 'http://localhost:8083/email';


  constructor(private http: HttpClient) { }

  sendmail(formData: FormData): Observable<Mail> {
    return this.http.post<Mail>(`${this.apiUrl}/mailsended`, formData);
  }
}
