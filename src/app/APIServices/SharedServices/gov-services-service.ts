import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IService, ServiceCategory } from '../../Utilities/Interfaces/IService';
import { SERVICE_CATEGORIES } from '../../DB/data';
import { SharedService } from './shared-service';

const CATEGORY_ID_MAP: Partial<Record<ServiceCategory, number>> = {
  'civil-status': 1,
  traffic: 2,
  passports: 3,
  supply: 4,
};

@Injectable({
  providedIn: 'root',
})
export class GovServicesService {
  constructor(private sharedService: SharedService) {}

  getAll(): Observable<IService[]> {
    return this.sharedService.getAllServices();
  }

  getByCategory(category: ServiceCategory): Observable<IService[]> {
    return this.sharedService.getAllServices().pipe(
      map((services: IService[]): IService[] => {
        if (category === 'all') return services;
        const categoryId = CATEGORY_ID_MAP[category];
        if (categoryId === undefined) return services;
        return services.filter((s: IService) => s.categoryId === categoryId);
      })
    );
  }

  getById(id: number): Observable<IService | undefined> {
    return this.sharedService.getAllServices().pipe(
      map((services: IService[]): IService | undefined => services.find((s) => s.id === id))
    );
  }

  search(query: string): Observable<IService[]> {
    return this.sharedService.getAllServices().pipe(
      map((services: IService[]): IService[] => {
        const q = query.trim().toLowerCase();
        if (!q) return services;
        return services.filter(
          (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        );
      })
    );
  }

  searchInCategory(query: string, category: ServiceCategory): Observable<IService[]> {
    return this.getByCategory(category).pipe(
      map((pool: IService[]): IService[] => {
        const q = query.trim().toLowerCase();
        if (!q) return pool;
        return pool.filter(
          (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
        );
      })
    );
  }

  getCategories() {
    return SERVICE_CATEGORIES;
  }
}