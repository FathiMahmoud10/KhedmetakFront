import { Component, inject, OnInit } from '@angular/core';
import { SharedService } from '../../../../APIServices/shared-service';

@Component({
  selector: 'app-services-cards-com',
  imports: [],
  templateUrl: './services-cards-com.html',
  styleUrl: './services-cards-com.scss',
})
export class ServicesCardsCom implements OnInit {

  AllServices = inject(SharedService).getAllServices();
  groupedServices: any[][] = [];

ngOnInit() {
  this.groupServices();
}

groupServices() {
  const chunkSize = 4;

  for (let i = 0; i < this.AllServices.length; i += chunkSize) {
    this.groupedServices.push(
      this.AllServices.slice(i, i + chunkSize)
    );
  }
}
  
}
