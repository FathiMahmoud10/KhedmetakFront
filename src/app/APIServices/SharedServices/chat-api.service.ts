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
}

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createSession(email: string): Observable<ApiResponse<any>> {
    const payload: NewSessionRequest = {
      userEmail: email,
      createdAt: new Date().toISOString()
    };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/Session/newSession`, payload);
  }

  sendMessage(message: string, sessionGuidId: string): Observable<ApiResponse<ChatResponse>> {
    const payload: ChatRequest = {
      message,
      sessionGuidId
    };
    return this.http.post<ApiResponse<ChatResponse>>(`${this.apiUrl}/AI/chat`, payload);
  }
}
