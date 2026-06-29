import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AdminSidebarService } from '../../../Services/admin-sidebar.service';
import { UserSidebarService } from '../../../Services/user-sidebar.service';
import { AuthService } from '../../../APIServices/SharedServices/auth.service';

@Component({
  selector: 'app-navbar-com',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar-com.html',
  styleUrl: './navbar-com.scss',
})
export class NavbarCom implements OnInit, OnDestroy {
  isAdminPage = false;
  isUserDashboardPage = false;
  isDarkMode = false;
  isAdmin = false;
  isLoggedIn = false;
  private routeSub?: Subscription;
  private navigationCount = 0;

  constructor(
    private router: Router,
    private location: Location,
    private adminSidebarService: AdminSidebarService,
    private userSidebarService: UserSidebarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    this.isDarkMode = saved === 'dark';
    document.body.classList.toggle('dark-theme', this.isDarkMode);

    this.updateAuthState();
    this.checkUrl(this.router.url);

    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.navigationCount++;
        this.checkUrl(event.urlAfterRedirects || event.url);
        this.updateAuthState();
        this.adminSidebarService.close();
        this.userSidebarService.close();
      });
  }

  private updateAuthState(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.getRole() === 'Admin';
  }

  private checkUrl(url: string): void {
    if (!url) return;
    const currentUrl = url.toLowerCase();

    // الاستثناء الصريح: عند الدخول لصفحة ملف الأدمن أو الرئيسية أو الحسابات، نلغي تفعيل وضع لوحات التحكم الداخلية
    if (currentUrl.includes('admin-profile') || currentUrl.includes('login') || currentUrl.includes('signup') || currentUrl.endsWith('/home') || currentUrl === '/') {
      this.isAdminPage = false;
      this.isUserDashboardPage = false;
      return;
    }

    // تفعيل وضع الأدمن الداخلي فقط في لوحة التحكم الإدارية الحقيقية (السايد بار الداخلي)
    this.isAdminPage = currentUrl.includes('/admin-dashboard') || currentUrl.includes('/admin/manage');

    // تفعيل وضع لوحة المستخدم فقط داخل الصفحات الداخلية الخاصة بالـ Dashboard
    this.isUserDashboardPage = currentUrl.includes('/user-dashboard') || 
                               currentUrl.includes('my-requests') || 
                               currentUrl.includes('my-files');
  }

  // خاصية ترجع true إذا كنا داخل لوحة تحكم داخلية مستقلة (أدمن أو مستخدم)
  get isDashboardPage(): boolean {
    return this.isAdminPage || this.isUserDashboardPage;
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  toggleSidebar(): void {
    if (this.isAdminPage) {
      this.adminSidebarService.toggle();
    } else if (this.isUserDashboardPage) {
      this.userSidebarService.toggle();
    }
  }

  goBack(): void {
    if (this.navigationCount > 0) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    try {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    } catch (e) {}
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
