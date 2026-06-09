import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCardComponent } from '../../../Components/service-card/service-card.component';
import { CategoryTabsComponent } from '../../../Components/ClientComponents/HomeComponents/ServicesComponents/category-tabs/category-tabs.component';
import { SearchBarComponent } from '../../../Components/search-bar/search-bar.component';
import { GovernmentService, ServiceCategory } from '../../../Utilities/Interfaces/IService';
import { GovServicesService } from '../../../APIServices/SharedServices/gov-services-service';


@Component({
  selector: 'app-traffic-services',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, CategoryTabsComponent, SearchBarComponent],
  templateUrl: './traffic-services.component.html',
  styleUrls: ['./traffic-services.component.scss'],
})
export class TrafficServicesComponent implements OnInit {
  services: GovernmentService[] = [];
  category: ServiceCategory = 'traffic';
  pageTitle = 'خدمات المرور';
  pageSubtitle = 'خدمات المرور وتراخيص القيادة والمركبات';

  constructor(private govService: GovServicesService) {}

  ngOnInit(): void {
    this.services = this.govService.getByCategory(this.category);
  }

  onSearch(query: string): void {
    this.services = this.govService.searchInCategory(query, this.category);
  }
}
