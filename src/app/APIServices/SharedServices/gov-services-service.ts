import { map, Observable } from "rxjs";
import { ApiResponse, GovServiceDto, IService } from "../../Utilities/Interfaces/IService";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class GovServicesService {

  // الـ Controller الحقيقي اسمه GovServicesController -> الروت /api/GovServices
  private apiUrl = `${environment.apiUrl}/GovServices`;
 private readonly base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllServices(): Observable<IService[]> {
    return this.http.get<ApiResponse<GovServiceDto[]>>(this.apiUrl).pipe(
      map(res => res.data.map(this.mapToService))
    );
  }

  getServicesByCategory(categoryId: number): Observable<IService[]> {
    const url =
      categoryId === 0
        ? `${this.base}/GovServices`
        : `${this.base}/GovServices/by-category/${categoryId}`;
 
    return this.http
      .get<ApiResponse<IService[]>>(url)
      .pipe(map((res) => res.data));
  }

  search(query: string): Observable<IService[]> {
    return this.http.get<ApiResponse<GovServiceDto[]>>(
      `${this.apiUrl}/search?query=${query}`
    ).pipe(
      map(res => res.data.map(this.mapToService))
    );
  }

  private mapToService(dto: GovServiceDto): IService {
    return {
  id: dto.id,
  srvName: dto.srvName,
  srvDesc: dto.srvDesc,
  categoryId: dto.categoryId,
  categoryName: dto.categoryName,
  srvFees: dto.srvFees,
  srvTime: dto.srvTime,
  estimatedFees: dto.estimatedFees,

};
  }
}