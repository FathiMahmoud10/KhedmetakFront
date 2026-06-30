import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserSidebarService } from '../../Services/user-sidebar.service';
import { AuthService } from '../../APIServices/SharedServices/auth.service';
import { LocationService, UserLocation } from '../../Services/location.service';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class UserSidebar implements OnInit, OnDestroy {
  isOpen = false;
  isLoggedIn = false;
  userName = 'زائر';
  userEmail = '';
  avatarUrl = 'assets/images/images.jpg';
  userLocation: UserLocation | null = null;
  private sub?: Subscription;

  constructor(
    private userSidebarService: UserSidebarService,
    private authService: AuthService,
    private locationService: LocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.userSidebarService.isOpen$.subscribe(open => {
      this.isOpen = open;
      if (open) this.refreshUserInfo();
    });
    this.refreshUserInfo();
    this.locationService.getLocation().then(loc => this.userLocation = loc);
  }

  private refreshUserInfo(): void {
    const token = this.authService.getTokenFromCookie();
    if (!token) {
      this.isLoggedIn = false;
      return;
    }
    const payload = this.authService.decodeJwt(token);
    this.isLoggedIn = !!payload;

    this.userName = payload?.name
      || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
      || 'مستخدم';
    this.userEmail = payload?.email
      || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
      || '';
    this.avatarUrl = 'assets/images/images.jpg';
  }

  onAvatarError(event: Event): void {
    this.avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.userName || 'U')}&background=298b64&color=fff`;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(): void {
    this.userSidebarService.close();
  }

  logout(): void {
    this.authService.logout();
    this.close();
    this.router.navigate(['/login']);
  }
}
