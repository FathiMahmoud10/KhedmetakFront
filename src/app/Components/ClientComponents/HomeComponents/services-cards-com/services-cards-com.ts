import { Component, inject, OnInit } from '@angular/core';
import { SharedService } from '../../../../APIServices/SharedServices/shared-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-services-cards-com',
  imports: [RouterLink],
  templateUrl: './services-cards-com.html',
  styleUrl: './services-cards-com.scss',
})
export class ServicesCardsCom implements OnInit {

  private sharedService = inject(SharedService);

  AllServices: any[] = [];
  groupedServices: any[][] = [];

  ngOnInit() {
    this.sharedService.getAllServices().subscribe((data) => {
      this.AllServices = data;
      this.groupServices();
    });
  }

  groupServices() {
    console.log(this.groupServices);
    console.log(this.AllServices);

    const chunkSize = 4;

    this.groupedServices = []; // reset (important)

    for (let i = 0; i < this.AllServices.length; i += chunkSize) {
      this.groupedServices.push(
        this.AllServices.slice(i, i + chunkSize)
      );
    }
  }
}