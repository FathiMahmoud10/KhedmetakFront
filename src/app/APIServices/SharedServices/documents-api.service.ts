import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../Utilities/Interfaces/IService';

export interface UserDocument {
  id: number;
  userId: number;
  requiredDocumentId?: number | null;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentsApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyDocuments(): Observable<ApiResponse<UserDocument[]>> {
    return this.http.get<ApiResponse<UserDocument[]>>(`${this.apiUrl}/Documents/my-documents`);
  }

  upload(file: File, requiredDocumentId?: number): Observable<ApiResponse<UserDocument>> {
    const form = new FormData();
    form.append('File', file);
    if (requiredDocumentId) {
      form.append('RequiredDocumentId', requiredDocumentId.toString());
    }
    return this.http.post<ApiResponse<UserDocument>>(`${this.apiUrl}/Documents/upload`, form);
  }

  // الباك إند بيرجع المسارات كـ /uploads/documents/xxx، نضيف الدومين عشان نقدر نفتح/نزل الملف
  fileUrl(filePath: string): string {
    const base = this.apiUrl.replace(/\/api\/?$/, '');
    return `${base}${filePath}`;
  }
}
