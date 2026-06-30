import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../APIServices/SharedServices/admin';

@Component({
  selector: 'app-admin-portal-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-portal-log.html',
  styleUrls: ['./admin-portal-log.scss']
})
export class AdminPortalLogComponent implements OnInit {
  portalTransactions: any[] = [];
  filteredTransactions: any[] = [];
  portalLoading = false;
  searchText = '';

  todayLabel = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year   : 'numeric',
    month  : 'long',
    day    : 'numeric',
  }).format(new Date());

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPortalTransactions();
  }

  loadPortalTransactions(): void {
    this.portalLoading = true;
    this.adminService.getPortalTransactions().subscribe({
      next: (res) => {
        this.portalTransactions = res?.data ?? res ?? [];
        this.applyFilter();
        this.portalLoading = false;
      },
      error: () => {
        this.portalTransactions = [];
        this.filteredTransactions = [];
        this.portalLoading = false;
      }
    });
  }

  applyFilter(): void {
    const search = (this.searchText || '').trim().toLowerCase();
    if (!search) {
      this.filteredTransactions = [...this.portalTransactions];
      return;
    }

    this.filteredTransactions = this.portalTransactions.filter(tx => {
      const citizenName = (tx.citizenName || '').toLowerCase();
      const nationalId = (tx.nationalId || '').toLowerCase();
      const transactionId = (tx.transactionId || '').toLowerCase();
      const serviceName = (tx.serviceName || '').toLowerCase();
      
      return citizenName.includes(search) || 
             nationalId.includes(search) || 
             transactionId.includes(search) ||
             serviceName.includes(search);
    });
  }
}
