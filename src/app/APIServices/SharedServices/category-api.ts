import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { CategoryDto } from '../../Utilities/Interfaces/ICategory';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../Utilities/Interfaces/IService';

@Injectable({
  providedIn: 'root',
})
export class CategoryAPI {
   private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  // الباك إند بيرجع البيانات ملفوفة جوه ApiResponse<IEnumerable<CategoryDto>>
  getAllCategories(): Observable<CategoryDto[]> {
    return this.http
      .get<ApiResponse<CategoryDto[]>>(this.apiUrl)
      .pipe(map(res => res.data));
  }
}
