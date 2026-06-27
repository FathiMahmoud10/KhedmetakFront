import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/Auth/login`, { email, password });
  }

  register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    nationalId?: string;
    phone?: string;
    dateOfBirth?: string | null;
    city?: string;
    district?: string;
    street?: string;
    buildingNumber?: string;
    floorNumber?: string;
    apartmentNumber?: string;
    postalCode?: string;
  }) {
    return this.http.post<any>(`${this.apiUrl}/Auth/register`, data);
  }

  getTokenFromCookie(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getTokenFromCookie();
    if (!token) return false;
    const payload = this.decodeJwt(token);
    return !!payload;
  }

  getRole(): string | null {
    const token = this.getTokenFromCookie();
    if (!token) return null;
    const payload = this.decodeJwt(token);
    if (!payload) return null;

    // الـ Backend بيستخدم ClaimTypes.Role اللي بيتحول لـ URI ده في الـ JWT
    const roleClaim =
      payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      ?? payload?.role
      ?? payload?.Role
      ?? null;

    // لو الـ roles جت كـ array (لو User معاه أكتر من role)، خد الأولى
    if (Array.isArray(roleClaim)) {
      return roleClaim[0] ?? null;
    }

    return roleClaim;
  }

  logout(): void {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  }
}
