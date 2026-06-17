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
      title: 'تجديد رخصة القيادة',
      img: '/Images/ServImgs/driver1.png',
      description: 'استخراج او تجديد رخصة القيادة الخاصة.',
      fees: 500,
      estimatedFees: 500,
      processingTime: 'يوم واحد',
      categoryId: 1,
      categoryName: 'خدمات المرور',
    },
    {
      id: 2,
      title: 'تجديد بطاقة الرقم القومي',
      img: '/Images/ServImgs/Id2.png',
      description: 'استخراج او تجديد بطاقة الرقم القومي الخاصة.',
      fees: 50,
      estimatedFees: 50,
      processingTime: '3 أيام',
      categoryId: 2,
      categoryName: 'خدمات الأحوال المدنية',
    },
  ];

  getAllServices(): Observable<IService[]> {
    return this.http.get<ApiResponse<GovServiceDto[]>>(`${this.apiUrl}/GovServices`).pipe(
      map((res) => res.data.map((dto) => this.mapDtoToService(dto))),
      catchError((err) => {
        console.warn('فشل الاتصال بالـ API، تم استخدام البيانات التجريبية بدلاً منه.', err);
        return of(this.mockServices);
      })
    );
  }

  private mapDtoToService(dto: GovServiceDto): IService {
    return {
      id: dto.id,
      title: dto.srvName,
      description: dto.srvDesc,
      img: this.categoryImgMap[dto.categoryId] || '/Images/ServImgs/Id2.png',
      fees: dto.srvFees,
      estimatedFees: dto.estimatedFees,
      processingTime: dto.srvTime,
      categoryId: dto.categoryId,
      categoryName: dto.categoryName,
    };
  }
}