import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
    // The backend may wrap the response in an ApiResponse. Unwrap if needed.
    return this.http.post<any>(`${this.apiUrl}/AI/chat`, payload).pipe(
      // If the response has a 'data' field, use it; otherwise assume it's already the ChatResponse.
      map(res => (res && res.success !== undefined && res.data !== undefined) ? res.data : res)
    ) as Observable<ChatResponse>;
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
