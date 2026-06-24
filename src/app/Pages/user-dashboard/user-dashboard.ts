import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../APIServices/SharedServices/auth.service';
import { UserDashboardService, UserDashboardStats } from '../../APIServices/SharedServices/user-dashboard.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.scss']
})
export class UserDashboard implements OnInit {
  loading = true;
  errorMsg = '';
  userName = 'مستخدم';

  stats: UserDashboardStats = {
    totalRequests: 0,
    pendingCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    rejectedCount: 0,
    totalUploadedFiles: 0,
    totalChatSessions: 0,
    recentRequests: []
  };

  todayLabel = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  constructor(
    private dashboardService: UserDashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.authService.getTokenFromCookie();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const payload = this.authService.decodeJwt(token);
    this.userName = payload?.name
      || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
      || 'مستخدم';

    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.errorMsg = '';

    this.dashboardService.getStats().subscribe({
      next: (res) => {
        if (res?.data) {
          this.stats = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('فشل تحميل إحصائيات الداشبورد:', err);
        this.errorMsg = 'تعذر تحميل الإحصائيات حالياً، حاول مرة أخرى لاحقاً.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'udash-badge--pending',
      'InProgress': 'udash-badge--progress',
      'Completed': 'udash-badge--success',
      'Rejected': 'udash-badge--danger',
    };
    return map[status] ?? 'udash-badge--default';
  }
}
