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
}
