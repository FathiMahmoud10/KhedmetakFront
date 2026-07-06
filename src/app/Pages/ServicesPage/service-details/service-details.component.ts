import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../Utilities/Interfaces/IService';

// ── API response shape ────────────────────────────────────────────────────
interface RequiredDocument {
  id: number;
  documentName: string;
  isMandatory: boolean;
  note?: string;
}

interface ServiceStep {
  id: number;
  title: string;
  description?: string;
  stepOrder: number;
}

interface ServiceFeeTier {
  id: number;
  tierName: string;
  fees: number;
  duration: string;
  isRefundable: boolean;
}

interface ServiceImportantNote {
  id: number;
  note: string;
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
  providerEntity: string;
  targetAudience: string;
  deliveryMethod: string;
  needsGuarantee: boolean;
  steps: ServiceStep[];
  requiredDocuments: RequiredDocument[];
  options: any[];
  generalDocs: any[];
  feeTiers: ServiceFeeTier[];
  importantNotes: ServiceImportantNote[];
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
      if (id) this.fetchService(Number(id));
      else {
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
          if (res.success && res.data) this.service = res.data;
          else this.notFound = true;
          this.isLoading = false;
        },
        error: () => {
          this.notFound = true;
          this.isLoading = false;
        },
      });
  }

  // ── Getters ──────────────────────────────────────────────────────────────
  get sortedSteps(): ServiceStep[] {
    return [...(this.service?.steps ?? [])].sort((a, b) => a.stepOrder - b.stepOrder);
  }
  get sortedDocs(): RequiredDocument[] {
    return [...(this.service?.requiredDocuments ?? [])].sort(
      (a, b) => (b.isMandatory ? 1 : 0) - (a.isMandatory ? 1 : 0)
    );
  }
  get sortedFeeTiers(): ServiceFeeTier[] { return this.service?.feeTiers ?? []; }
  get sortedNotes(): ServiceImportantNote[] { return this.service?.importantNotes ?? []; }

  // ── Theme ────────────────────────────────────────────────────────────────
  /** Main color per category (drives hero, buttons, accents) */
  getCategoryColor(): string {
    // كل الخدمات تستخدم نفس اللون الأخضر (زي البطاقة)
    return '#0f6b46';
  }
  getCategorySoft(): string {
    // very light tint of the main color for backgrounds
    const c = this.getCategoryColor();
    return c + '14'; // ~8% alpha in hex
  }
  getCategoryIcon(): string {
    const map: Record<number, string> = {
      1: 'fa-id-card',
      5: 'fa-car',
    };
    return map[this.service?.categoryId ?? 0] ?? 'fa-briefcase';
  }
  getDocIcon(i: number): string {
    const icons = ['fa-id-card', 'fa-briefcase', 'fa-location-dot', 'fa-camera',
                   'fa-file-lines', 'fa-stethoscope', 'fa-image', 'fa-graduation-cap',
                   'fa-shield-halved', 'fa-award'];
    return icons[i % icons.length];
  }
  getStepIcon(i: number): string {
    const icons = ['fa-pen-to-square', 'fa-circle-check', 'fa-user-tie',
                   'fa-camera', 'fa-money-check-dollar', 'fa-id-badge'];
    return icons[i % icons.length];
  }

  // ── Actions ──────────────────────────────────────────────────────────────
  goBack(): void { this.router.navigate(['/services']); }
  startService(): void {
    if (this.service?.id)
      this.router.navigate(['/chat'], { queryParams: { serviceId: this.service.id } });
  }
  askAssistant(): void { this.startService(); }
  saveFavorite(): void { /* hook up if needed */ }
}
