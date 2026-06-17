import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IService } from '../../Utilities/Interfaces/IService';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ===== بيانات تجريبية (Fallback) تُستخدم لو الـ API فشل =====
  private mockServices: IService[] = [
    { id: 1, title: 'تجديد رخصة القيادة', img: '/Images/ServImgs/driver1.png', description: 'استخراج او تجديد رخصة القيادة الخاصة.', categoryId: 1, categoryName: 'خدمات المرور' },
    { id: 2, title: 'تجديد بطاقة الرقم القومي', img: '/Images/ServImgs/Id2.png', description: 'استخراج او تجديد بطاقة الرقم القومي الخاصة.', categoryId: 2, categoryName: 'خدمات الأحوال المدنية' },
    { id: 3, title: 'تجديد جواز السفر', img: '/Images/ServImgs/passpor.png', description: 'استخراج او تجديد جواز السفر الخاص.', categoryId: 3, categoryName: 'خدمات الجوازات' },
    { id: 4, title: 'تجديد بطاقة الهوية', img: '/Images/ServImgs/Id2.png', description: 'استخراج او تجديد بطاقة الهوية الخاصة.', categoryId: 4, categoryName: 'خدمات الأحوال المدنية' },
    { id: 5, title: 'تجديد رخصة القيادة', img: '/Images/ServImgs/driver1.png', description: 'استخراج او تجديد رخصة القيادة الخاصة.', categoryId: 1, categoryName: 'خدمات المرور' },
    { id: 6, title: 'تجديد بطاقة الرقم القومي', img: '/Images/ServImgs/Id2.png', description: 'استخراج او تجديد بطاقة الرقم القومي الخاصة.', categoryId: 2, categoryName: 'خدمات الأحوال المدنية' },
    { id: 7, title: 'تجديد جواز السفر', img: '/Images/ServImgs/passpor.png', description: 'استخراج او تجديد جواز السفر الخاص.', categoryId: 3, categoryName: 'خدمات الجوازات' },
    { id: 8, title: 'تجديد بطاقة الهوية', img: '/Images/ServImgs/Id2.png', description: 'استخراج او تجديد بطاقة الهوية الخاصة.', categoryId: 4, categoryName: 'خدمات الأحوال المدنية' },
    { id: 9, title: 'تجديد رخصة القيادة', img: '/Images/ServImgs/driver1.png', description: 'استخراج او تجديد رخصة القيادة الخاصة.', categoryId: 1, categoryName: 'خدمات المرور' },
  ];

  getAllServices(): Observable<IService[]> {
    return this.http.get<IService[]>(`${this.apiUrl}/Services`).pipe(
      catchError((err) => {
        console.warn('فشل الاتصال بالـ API، تم استخدام البيانات التجريبية بدلاً منه.', err);
        return of(this.mockServices);
      })
    );
  }
}