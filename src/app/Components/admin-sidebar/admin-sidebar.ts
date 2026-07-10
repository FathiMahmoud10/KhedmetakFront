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
  adminName = 'مدير النظام';
  adminEmail = '';
  avatarUrl = 'assets/images/images.jpg';
  private sub?: Subscription;

  constructor(
    private adminSidebarService: AdminSidebarService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.adminSidebarService.isOpen$.subscribe(open => {
      this.isOpen = open;
      if (open) this.refreshAdminInfo();
    });
    this.refreshAdminInfo();
  }

  private refreshAdminInfo(): void {
    const token = this.authService.getTokenFromCookie();
    if (!token) return;
    const payload = this.authService.decodeJwt(token);
    if (!payload) return;

    this.adminName =
      payload?.name ||
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      'مدير النظام';
    this.adminEmail =
      payload?.email ||
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      '';
  }

  onAvatarError(event: Event): void {
    this.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.adminName || 'Admin')}&background=298b64&color=fff`;
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

  // تفعيل وضع "معاينة كمستخدم" (بدون أي تعديل في الراوتس)، والانتقال لداشبورد المستخدم
  previewAsUser(): void {
    this.close();
    this.authService.enableUserPreview();
    this.router.navigate(['/user-dashboard']);
  }

  logout(): void {
    this.adminSidebarService.close();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
