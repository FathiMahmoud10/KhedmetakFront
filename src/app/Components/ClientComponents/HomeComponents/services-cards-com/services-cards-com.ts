import { Component, inject, OnInit } from '@angular/core';
import { SharedService } from '../../../../APIServices/SharedServices/shared-service';

@Component({
  selector: 'app-services-cards-com',
  imports: [],
  templateUrl: './services-cards-com.html',
  styleUrl: './services-cards-com.scss',
})
export class ServicesCardsCom implements OnInit {

  AllServices: any[] = [];
  groupedServices: any[][] = [];

  private sharedService = inject(SharedService);

  ngOnInit() {
    this.sharedService.getAllServices().subscribe({
      next: (data) => {
        this.AllServices = data;
        this.groupServices();
      },
      error: (err) => {
        console.error('Error fetching services:', err);
      }
    });
  }

  groupServices() {
    const chunkSize = 4;
    this.groupedServices = [];

    for (let i = 0; i < this.AllServices.length; i += chunkSize) {
      this.groupedServices.push(
        this.AllServices.slice(i, i + chunkSize)
      );
    }
  }
}