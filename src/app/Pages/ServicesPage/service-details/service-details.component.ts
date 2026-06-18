import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../Utilities/Interfaces/IService';
// import { environment } from '../../../environments/environment';

// ── API response shape ────────────────────────────────────────────────────
interface RequiredDocument {
  id: number;
  documentName: string;
  isMandatory: boolean;
}

interface ServiceStep {
  id: number;
  title: string;
  stepOrder: number;
}

interface ServiceDetailApi {
  id: number;
  srvName: string;
  srvDesc: string;
  srvFees: number;
  srvTime: string;
  estimatedFees: number;
  categoryName: string;
  categoryId: number;
  steps: ServiceStep[];
  requiredDocuments: RequiredDocument[];
  options: any[];
  generalDocs: any[];
}


@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.scss'],
})
export class ServiceDetailsComponent implements OnInit {
  service: ServiceDetailApi | null = null;
  isLoading = true;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.fetchService(Number(id));
      } else {
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }

  private fetchService(id: number): void {
    this.isLoading = true;
    this.notFound = false;

    this.http
      .get<ApiResponse<ServiceDetailApi>>(`${environment.apiUrl}/GovServices/${id}`)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.service = res.data;
          } else {
            this.notFound = true;
          }
          this.isLoading = false;
        },
        error: () => {
          this.notFound = true;
          this.isLoading = false;
        },
      });
      console.log(this.service?.steps);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  getCategoryColor(): string {
    const colorMap: Record<number, string> = {
      1: '#298b64',
      2: '#f59e0b',
      3: '#6366f1',
      4: '#ef4444',
      5: '#487fb9',
      6: '#ec4899',
    };
    return colorMap[this.service?.categoryId ?? 0] ?? '#023264';
  }

  goBack(): void {
    this.router.navigate(['/services']);
  }

  startService(): void {
    console.log('Starting service:', this.service?.id);
  }

  askAssistant(): void {
    console.log('Ask assistant about:', this.service?.srvName);
  }
}