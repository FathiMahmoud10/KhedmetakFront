import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AdminSidebarService } from '../../../Services/admin-sidebar.service';
import { UserSidebarService } from '../../../Services/user-sidebar.service';
import { AuthService } from '../../../APIServices/SharedServices/auth.service';
import { ThemeService } from '../../../Services/theme.service';

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
  private themeSub?: Subscription;

  constructor(
    private router: Router,
    private adminSidebarService: AdminSidebarService,
    private userSidebarService: UserSidebarService,
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.themeService.isDarkMode;
    this.themeSub = this.themeService.isDarkMode$.subscribe(dark => {
      this.isDarkMode = dark;
    });

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
    this.themeSub?.unsubscribe();
  }

  toggleSidebar(): void {
    if (this.isAdminPage) {
      this.adminSidebarService.toggle();
    } else if (this.isUserDashboardPage) {
      this.userSidebarService.toggle();
    }
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
