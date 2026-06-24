import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminSidebarService } from '../../Services/admin-sidebar.service';

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

  constructor(private adminSidebarService: AdminSidebarService) {}

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
}
