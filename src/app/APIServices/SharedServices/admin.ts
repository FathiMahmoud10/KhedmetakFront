import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../Utilities/Interfaces/IService';
import { UpdateFeesDto } from '../../Pages/admin-fees/admin-fees'; // تأكدي من صحة مسار الـ Dto حسب مشروعكِ

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // الروابط الأساسية للـ APIs بناءً على تقسيم الباك إند
  private readonly baseAdminUrl = `${environment.apiUrl}/Admin`; 
  private readonly baseGovServicesUrl = `${environment.apiUrl}/admin/govservices`;

  constructor(private http: HttpClient) { }

  // ==========================================
  // 1. العمليات الخاصة بصفحة لوحة التحكم (Admin Dashboard)
  // ==========================================
  
  // جلب الإحصائيات العامة للمنصة (المستخدمين، الخدمات، الأقسام) من الروت المباشر
  getPlatformStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Statistics`);
  }

  // جلب كافة طلبات المواطنين الواردة للمنصة (تُترك كبيانات تجريبية في الكومبوننت حالياً)
  getAllRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseAdminUrl}/Requests`);
  }

  // اتخاذ إجراء بالقبول أو الرفض على طلب معين
  updateRequestStatus(requestId: number, status: string): Observable<any> {
    return this.http.put(`${this.baseAdminUrl}/Requests/${requestId}/status`, { status });
  }

  // ==========================================
  // 2. العمليات الخاصة بصفحة الرسوم (Admin Fees)
  // ==========================================
  
  // تحديث الرسوم الأساسية والتقديرية لخدمة حكومية معينة
  updateFees(serviceId: number, fees: UpdateFeesDto): Observable<any> {
    return this.http.put<any>(`${this.baseGovServicesUrl}/${serviceId}/fees`, fees);
  }

  // ==========================================
  // 3. العمليات الخاصة بالمستندات المطلوبة (Required Documents)
  // ==========================================
  
  // جلب كافة المستندات المطلوبة المقترنة بخدمة معينة
  getRequiredDocuments(serviceId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseGovServicesUrl}/${serviceId}/required-documents`);
  }

  // إضافة مستند مطلوب جديد لخدمة حكومية محددة
  createRequiredDocument(serviceId: number, dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseGovServicesUrl}/${serviceId}/required-documents`, dto);
  }

  // تعديل بيانات مستند مطلوب مضاف مسبقاً (الاسم، النوع، الإلزامية)
  updateRequiredDocument(serviceId: number, docId: number, dto: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseGovServicesUrl}/${serviceId}/required-documents/${docId}`, dto);
  }

  // حذف مستند مطلوب من قائمة مرفقات الخدمة
  deleteRequiredDocument(serviceId: number, docId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseGovServicesUrl}/${serviceId}/required-documents/${docId}`);
  }
}
