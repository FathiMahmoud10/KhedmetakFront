import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCardComponent } from '../../../Components/service-card/service-card.component';
import { CategoryTabsComponent } from '../../../Components/ClientComponents/HomeComponents/ServicesComponents/category-tabs/category-tabs.component';
import { SearchBarComponent } from '../../../Components/search-bar/search-bar.component';
import { IService, ServiceCategory } from '../../../Utilities/Interfaces/IService';
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
  category: ServiceCategory = 'all';
  pageTitle = 'جميع الخدمات';
  pageSubtitle = 'تصفّح الخدمات الحكومية المتاحة لك بسهولة';
  isLoading = true;

  constructor(private govService: GovServicesService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.isLoading = true;
    this.govService.getByCategory(this.category).subscribe((services) => {
      this.services = services;
      this.isLoading = false;
    });
  }

  onSearch(query: string): void {
    this.govService.searchInCategory(query, this.category).subscribe((services) => {
      this.services = services;
    });
  }
}