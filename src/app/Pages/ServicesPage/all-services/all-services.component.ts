import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCardComponent } from '../../../Components/service-card/service-card.component';
import { CategoryTabsComponent } from '../../../Components/ClientComponents/HomeComponents/ServicesComponents/category-tabs/category-tabs.component';
import { SearchBarComponent } from '../../../Components/search-bar/search-bar.component';
import { GovernmentService, ServiceCategory } from '../../../Utilities/Interfaces/IService';
import { GovServicesService } from '../../../APIServices/SharedServices/gov-services-service';
// import { GovernmentService, ServiceCategory } from '../../models/service.model';
// import { GovernmentServicesService } from '../../services/government-services.service';
// import { ServiceCardComponent } from '../../components/service-card/service-card.component';
// import { CategoryTabsComponent } from '../../components/category-tabs/category-tabs.component';
// import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

@Component({
  selector: 'app-all-services',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, CategoryTabsComponent, SearchBarComponent],
  templateUrl: './all-services.component.html',
  styleUrls: ['./all-services.component.scss'],
})
export class AllServicesComponent implements OnInit {
  services: GovernmentService[] = [];
  category: ServiceCategory = 'all';
  pageTitle = 'جميع الخدمات';
  pageSubtitle = 'تصفّح الخدمات الحكومية المتاحة لك بسهولة';

  constructor(private govService: GovServicesService) {}

  ngOnInit(): void {
    this.services = this.govService.getByCategory(this.category);
  }

  onSearch(query: string): void {
    this.services = this.govService.searchInCategory(query, this.category);
  }
}
