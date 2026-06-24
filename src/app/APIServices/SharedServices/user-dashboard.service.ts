import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../Utilities/Interfaces/IService';

export interface MyServiceRequest {
  chatSessionId: number;
  sessionGuidId: string;
  govServiceId?: number | null;
  serviceName: string;
  categoryName: string;
  status: string;       // Pending | InProgress | Completed | Rejected
  statusLabel: string;  // قيد الانتظار / قيد التنفيذ / مكتمل / مرفوض
  startedAt: string;
  endedAt?: string | null;
  messagesCount: number;
  uploadedDocumentsCount: number;
}

export interface UserDashboardStats {
  totalRequests: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  rejectedCount: number;
  totalUploadedFiles: number;
  totalChatSessions: number;
  recentRequests: MyServiceRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStats(): Observable<ApiResponse<UserDashboardStats>> {
    return this.http.get<ApiResponse<UserDashboardStats>>(`${this.apiUrl}/UserDashboard/stats`);
  }

  getMyRequests(): Observable<ApiResponse<MyServiceRequest[]>> {
    return this.http.get<ApiResponse<MyServiceRequest[]>>(`${this.apiUrl}/UserDashboard/my-requests`);
  }

  linkSessionToService(sessionGuidId: string, govServiceId?: number, status?: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/UserDashboard/link-session-service`, {
      sessionGuidId,
      govServiceId,
      status
    });
  }
}
