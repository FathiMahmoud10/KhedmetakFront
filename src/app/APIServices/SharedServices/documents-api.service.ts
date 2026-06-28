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
  // FIX: the backend builds FilePath with Path.Combine on Windows, which produces
  // backslashes (e.g. "uploads\3\file.png") and no leading slash. Concatenating that
  // straight onto the API origin gave broken URLs like "https://hostuploads\3\file.png",
  // so the preview ("عين") never actually loaded the image. We normalize the slashes
  // and guarantee exactly one "/" between the origin and the path.
  fileUrl(filePath: string): string {
    const base = this.apiUrl.replace(/\/api\/?$/, '');
    const normalizedPath = (filePath || '').replace(/\\/g, '/').replace(/^\/?/, '/');
    return `${base}${normalizedPath}`;
  }
}
