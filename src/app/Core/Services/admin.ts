import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // 👈 هذا السطر هو الذي يحل المشكلة ويسمح بالـ Injection
})
export class AdminService {
  // 1. استبدلي هذا الرابط برابط الـ API الفعلي الخاص بالـ Backend في مشروعكِ لاحقاً
  private apiUrl = 'http://localhost:3000/api/admin/profile'; 

  // 2. حقن الـ HttpClient لإجراء الاتصالات البرمجية
  constructor(private http: HttpClient) { }

  /**
   * دالة لإرسال بيانات ومسار صورة الأدمن المحدثة إلى السيرفر
   * @param profileData كائن يحتوي على البيانات المعدلة من الـ Form وصيغة الصورة
   */
  updateAdminProfile(profileData: any): Observable<any> {
    return this.http.put<any>(this.apiUrl, profileData);
  }
}

