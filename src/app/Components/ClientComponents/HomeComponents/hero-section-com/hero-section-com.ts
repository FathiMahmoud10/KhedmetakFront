import { Component, inject, OnInit } from '@angular/core';
import { SharedService } from '../../../../APIServices/SharedServices/shared-service';

@Component({
  selector: 'app-hero-section-com',
  imports: [],
  templateUrl: './hero-section-com.html',
  styleUrl: './hero-section-com.scss',
})
export class HeroSectionCom implements OnInit {
ServicesList: IService[] = [];

ALLservices = inject(SharedService).getAllServices();

ngOnInit(): void {
  this.ServicesList.push(this.ALLservices[0]);
  this.ServicesList.push(this.ALLservices[1]);
  this.ServicesList.push(this.ALLservices[2]);

}
}
