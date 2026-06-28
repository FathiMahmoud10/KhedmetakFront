import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../Utilities/Interfaces/IService';

export interface NewSessionRequest {
  userEmail: string;
  createdAt: string;
}

export interface ChatRequest {
  message: string;
  sessionGuidId: string;
}

export interface ChatResponse {
  message: string;
  sessionGuidId: string;
  reply?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createSession(email: string): Observable<any> {
    const payload = {
      userEmail: email,
      createdAt: new Date().toISOString()
    };
    return this.http.post<any>(`${this.apiUrl}/Session/newSession`, payload);
  }

  sendMessage(message: string, sessionGuidId: string): Observable<string> {
    const payload: ChatRequest = {
      message,
      sessionGuidId
    };
    return this.http.post(`${this.apiUrl}/AI/chat`, payload, { responseType: 'text' });
  }

  uploadDocument(file: File, chatSessionId: string | number, requiredDocumentId: number): Observable<any> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('ChatSessionId', chatSessionId.toString());
    formData.append('RequiredDocumentId', requiredDocumentId.toString());
    return this.http.post<any>(`${this.apiUrl}/UserDocument/upload`, formData);
  }

  getUserSessions(userEmail: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Session/UserSessions/${encodeURIComponent(userEmail)}`);
  }
}
