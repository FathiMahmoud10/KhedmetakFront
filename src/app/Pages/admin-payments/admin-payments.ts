import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../APIServices/SharedServices/admin';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payments.html',
  styleUrls: ['./admin-payments.scss']
})
export class AdminPaymentsComponent implements OnInit {
  payments: any[] = [];
  filteredPayments: any[] = [];
  loading = false;
  searchText = '';
  selectedStatus = '';
  selectedMethod = '';

  // Stats
  totalRevenue = 0;
  paidCount = 0;
  pendingCount = 0;

  todayLabel = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.adminService.getAllPayments().subscribe({
      next: (res) => {
        this.payments = res?.data ?? res ?? [];
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load payments:', err);
        this.payments = [];
        this.filteredPayments = [];
        this.calculateStats();
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalRevenue = this.payments
      .filter(p => p.status === 'PAID' || p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);

    this.paidCount = this.payments.filter(p => p.status === 'PAID' || p.status === 'SUCCESS').length;
    this.pendingCount = this.payments.filter(p => p.status === 'PENDING').length;
  }

  applyFilter(): void {
    this.filteredPayments = this.payments.filter(p => {
      // Search text filter (UserName, UserEmail, MerchantRefNum, FawryRefNumber)
      const search = (this.searchText || '').trim().toLowerCase();
      const userName = (p.userName || '').toLowerCase();
      const userEmail = (p.userEmail || '').toLowerCase();
      const refNum = (p.merchantRefNum || '').toLowerCase();
      const fawryRef = (p.fawryRefNumber || '').toLowerCase();

      const matchesSearch = !search || 
        userName.includes(search) || 
        userEmail.includes(search) || 
        refNum.includes(search) || 
        fawryRef.includes(search);

      // Status filter
      const matchesStatus = !this.selectedStatus || p.status === this.selectedStatus;

      // Method filter
      const matchesMethod = !this.selectedMethod || p.paymentMethod === this.selectedMethod;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'SUCCESS':
        return 'مدفوع';
      case 'PENDING':
        return 'قيد الانتظار';
      case 'UNPAID':
        return 'غير مدفوع';
      case 'EXPIRED':
        return 'منتهي الصلاحية';
      default:
        return status || 'غير معروف';
    }
  }

  getMethodLabel(method: string): string {
    if (!method) return 'غير محدد';
    switch (method.toUpperCase()) {
      case 'PAYATFAWRY':
      case 'FAWRY':
        return 'كود فوري';
      case 'CARD':
      case 'VISA':
        return 'فيزا / كارت بنكي';
      case 'VODAFONE':
      case 'VODAFONE_CASH':
        return 'فودافون كاش';
      default:
        return method;
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }
}
