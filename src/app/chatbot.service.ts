import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = 'http://localhost:8083/api/chatbot/ask';

  constructor(private http: HttpClient) {}

  ask(question: string): Observable<string> {
    // The backend returns plain text, so specify responseType as 'text'
    return this.http.post(this.apiUrl, { question }, { responseType: 'text' });
  }
}