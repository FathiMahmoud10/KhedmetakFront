import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCardComponent } from '../../../Components/service-card/service-card.component';
import { CategoryTabsComponent } from '../../../Components/ClientComponents/HomeComponents/ServicesComponents/category-tabs/category-tabs.component';
import { SearchBarComponent } from '../../../Components/search-bar/search-bar.component';
import { IService } from '../../../Utilities/Interfaces/IService';
import { GovServicesService } from '../../../APIServices/SharedServices/gov-services-service';

@Component({
  selector: 'app-all-services',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, CategoryTabsComponent, SearchBarComponent],
  templateUrl: './all-services.component.html',
  styleUrls: ['./all-services.component.scss'],
})
export class AllServicesComponent implements OnInit {
  services: IService[] = [];
  selectedCategoryId: number = 0; // 0 = all
  pageTitle = 'جميع الخدمات';
  pageSubtitle = 'تصفّح الخدمات الحكومية المتاحة لك بسهولة';
  isLoading = true;

  constructor(public govService: GovServicesService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  onCategoryChange(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.loadServices();
  }

  private loadServices(): void {
    this.isLoading = true;
    this.govService.getServicesByCategory(this.selectedCategoryId).subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: () => {
        this.services = [];
        this.isLoading = false;
      },
    });
  }
}