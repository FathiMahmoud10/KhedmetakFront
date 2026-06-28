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
      dto: {
        userEmail: email,
        createdAt: new Date().toISOString()
      }
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

  // FIX: chat sessions are identified by Guid everywhere in the backend (SessionGuidId).
  // There is no numeric "chatSessionId" available on the frontend - the "newSession"
  // endpoint only ever returns the Guid. Sending a fabricated/derived number here meant
  // the file never linked to the right session (or any session) on the backend.
  // Always send the Guid under the field name the backend expects: sessionGuidId.
  uploadDocument(file: File, sessionGuidId: string, requiredDocumentId: number): Observable<any> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('SessionGuidId', sessionGuidId);
    formData.append('RequiredDocumentId', requiredDocumentId.toString());
    return this.http.post<any>(`${this.apiUrl}/UserDocument/upload`, formData);
  }
}
