import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FooterCom } from "./Components/SharedComponents/footer-com/footer-com";
import { NavbarCom } from "./Components/SharedComponents/navbar-com/navbar-com";
import { AdminSidebar } from "./Components/admin-sidebar/admin-sidebar";
import { UserSidebar } from "./Components/user-sidebar/sidebar";

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, FooterCom, NavbarCom, AdminSidebar, UserSidebar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  showFooter: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
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
