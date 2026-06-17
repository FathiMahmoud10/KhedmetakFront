import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FooterCom } from "./Components/SharedComponents/footer-com/footer-com";
import { NavbarCom } from "./Components/SharedComponents/navbar-com/navbar-com";
import { Sidebar } from "./Components/sidebar/sidebar";

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, FooterCom, NavbarCom, Sidebar],
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
      
      const adminPages =
        currentUrl.includes('admin-profile') ||
        currentUrl.includes('admin-dashboard') ||
        currentUrl.includes('manage-services');

      const noFooterPages =
        adminPages ||
        currentUrl.includes('/chat') ||
        currentUrl.includes('/login') ||
        currentUrl.includes('/signup');

      this.showFooter = !noFooterPages;
    });
  }
}
