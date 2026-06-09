import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GovernmentService } from '../../../Utilities/Interfaces/IService';
import { GovServicesService } from '../../../APIServices/SharedServices/gov-services-service';
// import { GovernmentService } from '../../models/service.model';
// import { GovernmentServicesService } from '../../services/government-services.service';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.scss'],
})
export class ServiceDetailsComponent implements OnInit {
  service: GovernmentService | undefined;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private govService: GovServicesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.service = this.govService.getById(id);
        this.notFound = !this.service;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/services']);
  }

  startService(): void {
    // Hook into your AI assistant or form workflow
    console.log('Starting service:', this.service?.id);
  }

  askAssistant(): void {
    // Hook into Khedmetak AI chat
    console.log('Ask assistant about:', this.service?.title);
  }

  getCategoryRoute(): string {
    const routeMap: Record<string, string> = {
      traffic: '/services/traffic',
      'civil-status': '/services/civil-status',
      passports: '/services/passports',
      supply: '/services/supply',
      education: '/services/education',
      health: '/services/health',
    };
    return routeMap[this.service?.category || ''] || '/services';
  }

  getCategoryLabel(): string {
    const labelMap: Record<string, string> = {
      traffic: 'المرور',
      'civil-status': 'الأحوال المدنية',
      passports: 'الجوازات والهجرة',
      supply: 'التموين',
      education: 'التعليم',
      health: 'الصحة',
    };
    return labelMap[this.service?.category || ''] || 'الخدمات';
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
    return colorMap[this.service?.category || ''] || '#023264';
  }
}
