import { Component, inject, OnInit } from '@angular/core';
import { SharedService } from '../../../../APIServices/SharedServices/shared-service';
import { IService } from '../../../../Utilities/Interfaces/IService';

@Component({
  selector: 'app-hero-section-com',
  imports: [],
  templateUrl: './hero-section-com.html',
  styleUrl: './hero-section-com.scss',
})
export class HeroSectionCom implements OnInit {
  ServicesList: IService[] = [];

  private sharedService = inject(SharedService);

  ngOnInit(): void {
    this.sharedService.getAllServices().subscribe({
      next: (data) => {
        this.ServicesList = data.slice(0, 3);
      },
      error: (err) => {
        console.error('Error fetching services:', err);
      }
    });
  }
}