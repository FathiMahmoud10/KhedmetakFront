import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private router: Router,
    private adminSidebarService: AdminSidebarService,
    private userSidebarService: UserSidebarService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    this.isDarkMode = saved === 'dark';
    document.body.classList.toggle('dark-theme', this.isDarkMode);

    this.checkUrl(this.router.url);
    this.updateAuthState();

    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkUrl(event.url);
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
    this.isAdminPage =
      url.includes('admin') ||
      url.includes('manage');

    this.isUserDashboardPage =
      url.includes('user-dashboard') ||
      url.includes('my-requests') ||
      url.includes('my-files');
  }

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
