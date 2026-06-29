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

export interface CurrentServiceDetails {
  serviceName: string;
  categoryName: string;
  requiredDocumentsCount: number;
  fees: number;
  takenTime: string;
}

export interface ChatResponse {
  currentServiceDetails: CurrentServiceDetails;
  response: string;
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

  sendMessage(message: string, sessionGuidId: string): Observable<ChatResponse> {
    const payload: ChatRequest = {
      message,
      sessionGuidId
    };
    return this.http.post<ChatResponse>(`${this.apiUrl}/AI/chat`, payload);
  }

  // FIX: matches the real backend route — SessionController exposes
  // GET api/Session/SessionMsgs/{sessionGuidId}, returning
  // ApiResponse<List<ChatSessionMessageDTO>> (messageId/role/content) directly as `data`.
  getSessionHistory(sessionGuidId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Session/SessionMsgs/${sessionGuidId}`);
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

  /**
   * Submits a service request via multipart/form-data to /api/Session/submitRequest.
   */
  submitServiceRequest(data: {
    userEmail: string;
    govServiceId: number;
    sessionGuidId?: string;
    userName?: string;
    phoneNumber?: string;
    notes?: string;
    files?: File[];
  }): Observable<any> {
    const formData = new FormData();
    formData.append('UserEmail', data.userEmail);
    formData.append('GovServiceId', data.govServiceId.toString());
    if (data.sessionGuidId) formData.append('SessionGuidId', data.sessionGuidId);
    if (data.userName) formData.append('UserName', data.userName);
    if (data.phoneNumber) formData.append('PhoneNumber', data.phoneNumber);
    if (data.notes) formData.append('Notes', data.notes);
    if (data.files && data.files.length > 0) {
      data.files.forEach(f => formData.append('Files', f));
    }
    return this.http.post<any>(`${this.apiUrl}/Session/submitRequest`, formData);
  }
}
