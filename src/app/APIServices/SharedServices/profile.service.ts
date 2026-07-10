import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../Utilities/Interfaces/IService';

export interface UserProfile {
  fullName: string;
  email: string;
  phone?: string;
  nationalId?: string;
  dateOfBirth?: string | null;
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
  floorNumber?: string;
  apartmentNumber?: string;
  postalCode?: string;
  avatarUrl?: string;
}

export interface UpdateUserProfile {
  fullName: string;
  phone?: string;
  nationalId?: string;
  city?: string;
  district?: string;
  street?: string;
  currentPassword?: string;
  newPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/Profile`);
  }

  updateProfile(data: UpdateUserProfile): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Profile`, data);
  }
}
