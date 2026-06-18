import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Sidebar } from '../../../app/Components/sidebar/sidebar'; // المسار الصحيح واسم الكلاس الصحيح
import { environment } from '../../../environments/environment';

// ── Interfaces ──────────────────────────────────────────────
interface Step {
  id: number;
  title: string;
  stepOrder: number;
}

interface RequiredDocument {
  id: number;
  documentName: string;
  isMandatory: boolean;
}

interface ServiceDetail {
  id: number;
  srvName: string;
  srvDesc: string;
  srvFees: number;
  srvTime: string;
  estimatedFees: number;
  categoryName: string;
  categoryId: number;
  steps: Step[];
  requiredDocuments: RequiredDocument[];
  options: any[];
  generalDocs: any[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ServiceDetail;
}

// ── Component ────────────────────────────────────────────────
@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [Sidebar, CommonModule], // استخدام المكون المصحح هنا
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {

  service: ServiceDetail | null = null;
  isLoading = true;
  hasError   = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadService(+id);
    }
  }

  private loadService(id: number): void {
    this.isLoading = true;
    this.hasError  = false;

    this.http.get<ApiResponse>(`${environment.apiUrl}/admin/govservices/${id}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.service = res.data;
        } else {
          this.hasError = true;
        }
        this.isLoading = false;
      },
      error: () => {
        this.hasError  = true;
        this.isLoading = false;
      }
    });
  }

  /** ترتيب الخطوات تصاعدياً */
  get sortedSteps(): Step[] {
    return [...(this.service?.steps ?? [])].sort((a, b) => a.stepOrder - b.stepOrder);
  }

  /** المستندات الإلزامية أولاً */
  get sortedDocs(): RequiredDocument[] {
    return [...(this.service?.requiredDocuments ?? [])].sort(
      (a, b) => (b.isMandatory ? 1 : 0) - (a.isMandatory ? 1 : 0)
    );
  }
}
