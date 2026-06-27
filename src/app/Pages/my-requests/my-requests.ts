import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../APIServices/SharedServices/auth.service';
import { UserDashboardService, MyServiceRequest } from '../../APIServices/SharedServices/user-dashboard.service';

type StatusFilter = 'all' | 'Pending' | 'InProgress' | 'Completed' | 'Rejected';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-requests.html',
  styleUrls: ['./my-requests.scss']
})
export class MyRequests implements OnInit {
  loading = true;
  errorMsg = '';

  allRequests: MyServiceRequest[] = [];
  activeFilter: StatusFilter = 'all';

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
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.errorMsg = '';

    this.dashboardService.getMyRequests().subscribe({
      next: (res) => {
        this.allRequests = res?.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('فشل تحميل طلباتي:', err);
        this.errorMsg = 'تعذر تحميل طلباتك حالياً، حاول مرة أخرى لاحقاً.';
        this.loading = false;
      }
    });
  }

  get filteredRequests(): MyServiceRequest[] {
    if (this.activeFilter === 'all') return this.allRequests;
    return this.allRequests.filter(r => r.status === this.activeFilter);
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter = filter;
  }

  countByStatus(status: StatusFilter): number {
    if (status === 'all') return this.allRequests.length;
    return this.allRequests.filter(r => r.status === status).length;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending': 'ureq-badge--pending',
      'InProgress': 'ureq-badge--progress',
      'Completed': 'ureq-badge--success',
      'Rejected': 'ureq-badge--danger',
    };
    return map[status] ?? 'ureq-badge--default';
  }
}
