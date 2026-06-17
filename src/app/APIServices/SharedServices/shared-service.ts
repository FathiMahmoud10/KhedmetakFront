import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, GovServiceDto, IService } from '../../Utilities/Interfaces/IService';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // صورة افتراضية لكل تصنيف، تُستخدم لو الـ API مش راجع صورة
  private categoryImgMap: Record<number, string> = {
    1: '/Images/ServImgs/Id2.png',
    2: '/Images/ServImgs/driver1.png',
    3: '/Images/ServImgs/passpor.png',
    4: '/Images/ServImgs/Id2.png',
  };

  // ===== بيانات تجريبية (Fallback) تُستخدم لو الـ API فشل =====
  private mockServices: IService[] = [
    {
      id: 1,
      srvName: 'تجديد رخصة القيادة',
      // img: '/Images/ServImgs/driver1.png',
      srvDesc: 'استخراج او تجديد رخصة القيادة الخاصة.',
      srvFees: 500,
      estimatedFees: 500,
      srvTime: 'يوم واحد',
      categoryId: 1,
      categoryName: 'خدمات المرور',
    },
    {
      id: 2,
      srvName: 'تجديد بطاقة الرقم القومي',
      // img: '/Images/ServImgs/Id2.png',
      srvDesc: 'استخراج او تجديد بطاقة الرقم القومي الخاصة.',
      srvFees: 50,
      estimatedFees: 50,
      srvTime: '3 أيام',
      categoryId: 2,
      categoryName: 'خدمات الأحوال المدنية',
    },
  ];

  // getAllServices(): Observable<IService[]> {
  //   return this.http.get<ApiResponse<GovServiceDto[]>>(`${this.apiUrl}/GovServices`).pipe(
  //     map((res) => res.data.map((dto) => this.mapDtoToService(dto))),
  //     catchError((err) => {
  //       console.warn('فشل الاتصال بالـ API، تم استخدام البيانات التجريبية بدلاً منه.', err);
  //       return of(this.mockServices);
  //     })
  //   );
  // }

  getAllServices(): Observable<IService[]> {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJheWFAa2hlZG1ldGFrLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJBeWEiLCJqdGkiOiIxM2RhMzc5NS0yMzBmLTQ0MzQtYWY1Ny02MTQ5MzEwMTRhYWEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVc2VyIiwiZXhwIjoxNzgxOTE4MDExLCJpc3MiOiJLaGVkbWV0YWsiLCJhdWQiOiJLaGVkbWV0YWtVc2VycyJ9.YcKktZe2G1lWz90X4igiQe7CT9H_tX5svYSnI3sJgkU"//localStorage.getItem('token');

  return this.http.get<ApiResponse<GovServiceDto[]>>(
    `${this.apiUrl}/GovServices`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).pipe(
    map((res) => {
      console.log('API Response:', res);
      return res.data.map((dto) => this.mapDtoToService(dto));
    }),
    catchError((err) => {
      console.error('API Error:', err);
      return of(this.mockServices);
    })
  );
}
  private mapDtoToService(dto: GovServiceDto): IService {
    return {
      id: dto.id,
      srvName: dto.srvName,
      srvDesc: dto.srvDesc,
      // img: this.categoryImgMap[dto.categoryId] || '/Images/ServImgs/Id2.png',
      srvFees: dto.srvFees,
      estimatedFees: dto.estimatedFees,
      srvTime: dto.srvTime,
      categoryId: dto.categoryId,
      categoryName: dto.categoryName,
    };
  }
}