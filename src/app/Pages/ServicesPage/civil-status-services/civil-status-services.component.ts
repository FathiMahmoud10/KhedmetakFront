import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCardComponent } from '../../../Components/service-card/service-card.component';
import { CategoryTabsComponent } from '../../../Components/ClientComponents/HomeComponents/ServicesComponents/category-tabs/category-tabs.component';
import { SearchBarComponent } from '../../../Components/search-bar/search-bar.component';
import { GovernmentService, ServiceCategory } from '../../../Utilities/Interfaces/IService';
import { GovServicesService } from '../../../APIServices/SharedServices/gov-services-service';


@Component({
  selector: 'app-civil-status-services',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, CategoryTabsComponent, SearchBarComponent],
  templateUrl: './civil-status-services.component.html',
  styleUrls: ['./civil-status-services.component.scss'],
})
export class CivilStatusServicesComponent implements OnInit {
  services: GovernmentService[] = [];
  category: ServiceCategory = 'civil-status';
  pageTitle = 'خدمات الأحوال المدنية';
  pageSubtitle = 'خدمات الهوية والوثائق المدنية';

  constructor(private govService: GovServicesService) {}

  ngOnInit(): void {
    this.services = this.govService.getByCategory(this.category);
  }

  onSearch(query: string): void {
    this.services = this.govService.searchInCategory(query, this.category);
  }
}
