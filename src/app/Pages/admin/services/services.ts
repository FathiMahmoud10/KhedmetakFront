import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// تصحيح المسارات بالخروج 4 خطوات فقط للخلف
import { Sidebar } from '../../../Components/SharedComponents/sidebar/sidebar';
import { AdminNavbar } from '../../../Components/SharedComponents/admin-navbar/admin-navbar';

export interface GovService {
  id: number;
  serviceName: string;
  description: string;
  fees: number;
  estimatedTime: string;
}

@Component({
  selector: 'app-services',
  imports: [RouterOutlet, Sidebar, AdminNavbar], 
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  services: GovService[] = [
    {
      id: 1,
      serviceName: 'National ID',
      description: 'Issue ID Card',
      fees: 150,
      estimatedTime: '7 Days'
    }
  ];
}

