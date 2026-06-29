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

  // FIX: matches the real backend route — SessionController exposes
  // GET api/Session/SessionMsgs/{sessionGuidId}, returning
  // ApiResponse<List<ChatSessionMessageDTO>> (messageId/role/content) directly as `data`.
  getSessionHistory(sessionGuidId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Session/SessionMsgs/${sessionGuidId}`);
  }

  // رفع ملف من الشات — بيروح على ChatController اللي مش محتاج token
  // بيشتغل مع guests و logged-in users عبر الـ SessionGuidId
  uploadDocument(file: File, sessionGuidId: string, requiredDocumentId: number): Observable<any> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('SessionGuidId', sessionGuidId);
    formData.append('RequiredDocumentId', requiredDocumentId.toString());
    return this.http.post<any>(`${this.apiUrl}/Chat/upload`, formData);
  }
}
