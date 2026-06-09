import { Injectable } from '@angular/core';
import { GovernmentService, ServiceCategory } from '../../Utilities/Interfaces/IService';
import { GOVERNMENT_SERVICES, SERVICE_CATEGORIES } from '../../DB/data';

@Injectable({
  providedIn: 'root',
})
export class GovServicesService {
  
  getAll(): GovernmentService[] {
    return GOVERNMENT_SERVICES;
  }

  getByCategory(category: ServiceCategory): GovernmentService[] {
    if (category === 'all') return GOVERNMENT_SERVICES;
    return GOVERNMENT_SERVICES.filter(s => s.category === category);
  }

  getById(id: string): GovernmentService | undefined {
    return GOVERNMENT_SERVICES.find(s => s.id === id);
  }

  search(query: string): GovernmentService[] {
    const q = query.trim().toLowerCase();
    if (!q) return GOVERNMENT_SERVICES;
    return GOVERNMENT_SERVICES.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }

  searchInCategory(query: string, category: ServiceCategory): GovernmentService[] {
    const pool = this.getByCategory(category);
    const q = query.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }

  getCategories() {
    return SERVICE_CATEGORIES;
  }
}
