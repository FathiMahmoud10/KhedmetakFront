import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminSidebarService } from '../../Services/admin-sidebar.service';
import { AuthService } from '../../APIServices/SharedServices/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrls: ['./admin-sidebar.scss']
})
export class AdminSidebar implements OnInit, OnDestroy {
  isOpen = false;
  isServicesCollapsed = false;
  private sub?: Subscription;

  constructor(
    private adminSidebarService: AdminSidebarService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.adminSidebarService.isOpen$.subscribe(open => {
      this.isOpen = open;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(): void {
    this.adminSidebarService.close();
  }

  toggleServicesCollapse(): void {
    this.isServicesCollapsed = !this.isServicesCollapsed;
  }

  logout(): void {
    this.adminSidebarService.close();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
