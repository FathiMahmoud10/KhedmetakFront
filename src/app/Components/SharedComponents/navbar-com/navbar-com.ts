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
  // FIX: counts how many in-app navigations happened so "العودة للموقع" can go back
  // to the page the user actually came from instead of always jumping to /home.
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

    this.checkUrl(this.router.url);
    this.updateAuthState();

    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.navigationCount++;
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

  // FIX: "العودة للموقع" used to be a hardcoded routerLink="/home", so it always
  // dropped the user on the homepage instead of the page they came from.
  // We now go back in the app's own navigation history (Location.back), and only
  // fall back to /home when there's nowhere to go back to (e.g. direct page load).
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
