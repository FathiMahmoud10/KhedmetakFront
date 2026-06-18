// import { Component, OnInit } from '@angular/core';
// import { IService, ServiceCategory } from '../../../Utilities/Interfaces/IService';
// import { GovServicesService } from '../../../APIServices/SharedServices/gov-services-service';
// import { SearchBarComponent } from "../../../Components/search-bar/search-bar.component";
// import { CategoryTabsComponent } from "../../../Components/ClientComponents/HomeComponents/ServicesComponents/category-tabs/category-tabs.component";
// import { ServiceCardComponent } from "../../../Components/service-card/service-card.component";

// @Component({
//   selector: 'app-traffic-services',
//   templateUrl: './traffic-services.component.html',
//   styleUrls: ['./traffic-services.component.scss'],
//   imports: [SearchBarComponent, CategoryTabsComponent, ServiceCardComponent]
// })
// export class TrafficServicesComponent implements OnInit {

//   services: IService[] = [];

//   category: ServiceCategory = 'traffic';

//   pageTitle = 'خدمات المرور';
//   pageSubtitle = 'خدمات المرور وتراخيص القيادة والمركبات';

//   constructor(private govService: GovServicesService) {}

//   ngOnInit(): void {
//     this.govService.getByCategory(this.category).subscribe({
//       next: (data) => {
//         this.services = data;
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }

//   onSearch(query: string): void {
//     this.govService.searchInCategory(query, this.category).subscribe({
//       next: (data) => {
//         this.services = data;
//       },
//       error: (err) => {
//         console.error(err);
//       }
//     });
//   }
// }