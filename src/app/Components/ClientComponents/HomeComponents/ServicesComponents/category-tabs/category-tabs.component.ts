import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// import { ServiceCategoryTab } from '../../../../../Utilities/Interfaces/IService';
import { GovServicesService } from '../../../../../APIServices/SharedServices/gov-services-service';
import { ServiceCategoryTab } from '../../../../../Utilities/Interfaces/IService';
// import { ServiceCategoryTab } from '../../models/service.model';
// import { GovernmentServicesService } from '../../services/government-services.service';

@Component({
  selector: 'app-category-tabs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-tabs.component.html',
  styleUrls: ['./category-tabs.component.scss'],
})
export class CategoryTabsComponent implements OnInit {
  @Input() activeRoute = '';
  categories: ServiceCategoryTab[] = [];

  constructor(
    private govService: GovServicesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categories = this.govService.getCategories();
  }

  isActive(route: string): boolean {
    if (route === '/services') {
      return this.router.url === '/services' || this.router.url === '/services/all';
    }
    return this.router.url.startsWith(route);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
