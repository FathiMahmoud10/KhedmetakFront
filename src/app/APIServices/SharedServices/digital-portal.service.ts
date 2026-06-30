import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DigitalPortalService {
  private readonly base = `${environment.apiUrl}/DigitalPortal`;

  constructor(private http: HttpClient) {}

  /**
   * إرسال OTP للمواطن عبر بوابة مصر الرقمية
   * POST /api/DigitalPortal/send-otp
   */
  sendOtp(nationalId: string, phoneNumber: string): Observable<any> {
    return this.http.post<any>(`${this.base}/send-otp`, {
      nationalId,
      phoneNumber
    });
  }

  /**
   * التحقق من OTP والحصول على JWT token
   * POST /api/DigitalPortal/verify-otp-login
   */
  verifyOtpAndLogin(
    nationalId: string,
    phoneNumber: string,
    otp: string
  ): Observable<any> {
    return this.http.post<any>(`${this.base}/verify-otp-login`, {
      nationalId,
      phoneNumber,
      otp
    });
  }

  /**
   * سحب المستندات الرسمية من البوابة للمستخدم الحالي
   * POST /api/DigitalPortal/sync-documents
   */
  syncDocuments(nationalId?: string): Observable<any> {
    return this.http.post<any>(`${this.base}/sync-documents`, {
      nationalId: nationalId ?? null
    });
  }
}
