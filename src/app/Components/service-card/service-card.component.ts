import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { IService } from '../../Utilities/Interfaces/IService';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss'],
})
export class ServiceCardComponent {
  @Input() service!: IService;

  constructor(private router: Router) {}

  viewDetails(): void {
    this.router.navigate(['/services/details', this.service.id]);
  }

  getCategoryColor(): string {
    const colorMap: Record<number, string> = {
      1: '#298b64', // الأحوال المدنية
      2: '#f59e0b', // المرور
      3: '#6366f1', // الجوازات
      4: '#ef4444', // التموين
    };
    return colorMap[this.service.categoryId] || '#023264';
  }
}