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

  // جلب جميع طلبات المواطنين الحقيقية من قاعدة البيانات
  getAllRequests(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Admin/Requests`);
  }

  // تحديث حالة طلب المواطن — عند الحالة "Completed" يُصدر المستند تلقائياً من البوابة الرقمية
  updateRequestStatus(requestId: number, status: string): Observable<any> {
    return this.http.put<any>(
      `${environment.apiUrl}/Admin/Requests/${requestId}/status`,
      { status }
    );
  }

  // جلب سجل معاملات بوابة مصر الرقمية للتأكد من وصول الطلبات
  getPortalTransactions(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/external/portal/transactions`);
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

  // جلب كافة المستندات القياسية (للـ dropdown)
  getStandardDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/StandardDocuments`);
  }

  // إضافة مستند قياسي جديد (Multipart/Form-Data)
  createStandardDocument(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/StandardDocuments`, formData);
  }

  // تعديل مستند قياسي (Multipart/Form-Data)
  updateStandardDocument(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/StandardDocuments/${id}`, formData);
  }

  // حذف مستند قياسي
  deleteStandardDocument(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/StandardDocuments/${id}`);
  }

  // جلب كافة المستندات المطلوبة المقترنة بخدمة معينة
  getRequiredDocuments(serviceId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseGovServicesUrl}/${serviceId}/required-documents`);
  }

  // إضافة مستند مطلوب جديد لخدمة حكومية محددة — يرسل JSON لأن الباك إند يستخدم [FromBody]
  createRequiredDocument(serviceId: number, dto: {
    documentName: string;
    isMandatory: boolean;
    documentType: number;
    govServiceId: number;
    standardDocumentId?: number | null;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseGovServicesUrl}/${serviceId}/required-documents`, dto);
  }

  // تعديل بيانات مستند مطلوب — يرسل JSON لأن الباك إند يستخدم [FromBody]
  updateRequiredDocument(serviceId: number, docId: number, dto: {
    id: number;
    documentName: string;
    isMandatory: boolean;
    documentType: number;
    standardDocumentId?: number | null;
  }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseGovServicesUrl}/${serviceId}/required-documents/${docId}`, dto);
  }

  // حذف مستند مطلوب من قائمة مرفقات الخدمة
  deleteRequiredDocument(serviceId: number, docId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseGovServicesUrl}/${serviceId}/required-documents/${docId}`);
  }
}
