import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FooterCom } from "./Components/SharedComponents/footer-com/footer-com";
import { NavbarCom } from "./Components/SharedComponents/navbar-com/navbar-com";

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, FooterCom, NavbarCom],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  // استخدام متغير showFooter الموحد للتحكم في ظهور الفوتر السفلي
  showFooter: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // مراقبة التنقل بين الروابط لإخفاء الفوتر السفلي فقط في صفحات الأدمن
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentUrl = event.url;
      
      // إذا كان الرابط يخص صفحات الأدمن، نقوم بإخفاء الفوتر
      if (
        currentUrl.includes('admin-profile') || 
        currentUrl.includes('admin-dashboard') || 
        currentUrl.includes('manage-services')
      ) {
        this.showFooter = false;
      } else {
        this.showFooter = true;
      }
    });
  }
}
