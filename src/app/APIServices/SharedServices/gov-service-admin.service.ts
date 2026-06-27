import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../Utilities/Interfaces/IService';

export interface ImportRowErrorDto {
  rowNumber: number;
  message: string;
}

export interface ImportServicesResultDto {
  totalRowsRead: number;
  rowsProcessed: number;
  servicesCreated: number;
  servicesUpdated: number;
  stepsCreated: number;
  documentsCreated: number;
  categoriesCreated: number;
  errors: ImportRowErrorDto[];
}

// مطابق لـ CreateGovServiceDto في الباك إند (AdminServicesController -> POST /api/admin/govservices)
export interface CreateGovServiceDto {
  srvName: string;
  srvDesc: string;
  categoryId: number;
  srvFees: number;
  srvTime: string;
  estimatedFees: number;
}

// مطابق لـ UpdateGovServiceDto (PUT /api/admin/govservices/{id})
export interface UpdateGovServiceDto {
  srvName: string;
  srvDesc: string;
  categoryId: number;
  srvFees: number;
  srvTime: string;
  estimatedFees: number;
}

@Injectable({
  providedIn: 'root'
})
export class GovServiceAdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin/govservices`;

  constructor(private http: HttpClient) { }


  importFromExcel(file: File): Observable<ApiResponse<ImportServicesResultDto>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<ApiResponse<ImportServicesResultDto>>(
      `${this.apiUrl}/import-excel`,
      formData
    );
  }

  // إضافة خدمة حكومية جديدة
  createService(dto: CreateGovServiceDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, dto);
  }

  // تعديل خدمة موجودة
  updateService(id: number, dto: UpdateGovServiceDto): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, dto);
  }

  // حذف خدمة
  deleteService(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
  
}
