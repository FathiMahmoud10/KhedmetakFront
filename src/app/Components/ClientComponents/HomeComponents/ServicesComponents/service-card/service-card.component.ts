import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GovernmentService } from '../../../../../Utilities/Interfaces/IService';
// import { GovernmentService } from '../../models/service.model';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss'],
})
export class ServiceCardComponent {
  @Input() service!: GovernmentService;

  constructor(private router: Router) {}

  viewDetails(): void {
    this.router.navigate(['/services/details', this.service.id]);
  }

  getCategoryColor(): string {
    const colorMap: Record<string, string> = {
      traffic: '#f59e0b',
      'civil-status': '#298b64',
      passports: '#6366f1',
      supply: '#ef4444',
      education: '#487fb9',
      health: '#ec4899',
    };
    return colorMap[this.service.category] || '#023264';
  }

  getCategoryLabel(): string {
    const labelMap: Record<string, string> = {
      traffic: 'المرور',
      'civil-status': 'الأحوال المدنية',
      passports: 'الجوازات',
      supply: 'التموين',
      education: 'التعليم',
      health: 'الصحة',
    };
    return labelMap[this.service.category] || '';
  }
}
