import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// ============================================================
// Models — مطابقة لشكل الـ Response اللي وصلني من الـ API
// ============================================================
export interface ServiceStep {
  id?: number;
  title: string;
  stepOrder: number;
}

export interface GovService {
  id: number;
  srvName: string;
  srvDesc: string;
  srvFees: number;
  srvTime: string;
  estimatedFees: number;
  categoryName: string;
  categoryId: number;
  steps?: Array<{ order: number; description: string; title?: string; id?: number }>;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Component({
  selector: 'app-service-steps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-steps.html',
  styleUrls: ['./service-steps.scss']
})
export class ServiceSteps implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ⚠️ محدث لمسار الـ API بناءً على بقية المشروع
  private apiBase = `${environment.apiUrl}/GovServices`;
  private adminApiBase = `${environment.apiUrl}/admin/govservices`;

  stepsList: ServiceStep[] = [];
  govServices: GovService[] = [];
  selectedServiceId: number | null = null;
  isLoading = false;
  errorMsg = '';

  newStep = {
    title: '',
    stepOrder: 1
  };
  isAdding = false;

  ngOnInit(): void {
    this.loadGovServices();

    const idParam = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('serviceId');
    if (idParam) {
      this.selectedServiceId = +idParam;
      this.loadSteps();
    }
  }

  get selectedServiceName(): string {
    return this.govServices.find(s => s.id === this.selectedServiceId)?.srvName ?? '';
  }

  private get serviceUrl(): string {
    return `${this.apiBase}/${this.selectedServiceId}`;
  }

  private get stepsUrl(): string {
    return `${this.adminApiBase}/${this.selectedServiceId}/steps`;
  }

  private loadGovServices(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.http.get<ApiResponse<GovService[]>>(`${this.apiBase}`).subscribe({
      next: (res) => {
        this.govServices = res?.data ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'حدث خطأ أثناء تحميل خدمات الحكومة';
        this.isLoading = false;
      }
    });
  }

  private mapServiceSteps(service: GovService): ServiceStep[] {
    return (service.steps ?? [])
      .map((step) => ({
        id: step.id,
        title: step.title?.trim() || step.description?.trim() || '',
        stepOrder: step.order
      }))
      .sort((a, b) => a.stepOrder - b.stepOrder);
  }

  onServiceChange(): void {
    this.errorMsg = '';
    this.stepsList = [];

    if (this.selectedServiceId) {
      this.loadSteps();
    }
  }

  // --------------------------------------------------------
  // GET — تحميل خطوات الخدمة
  // --------------------------------------------------------
  loadSteps(): void {
    if (!this.selectedServiceId) {
      this.stepsList = [];
      return;
    }

    const selectedService = this.govServices.find((service) => service.id === this.selectedServiceId);
    if (selectedService?.steps?.length) {
      this.stepsList = this.mapServiceSteps(selectedService);
      this.newStep.stepOrder = this.stepsList.length + 1;
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    this.http.get<any>(this.serviceUrl).subscribe({
      next: (res) => {
        const serviceData: GovService = res?.data ?? res;
        this.stepsList = this.mapServiceSteps(serviceData);
        this.newStep.stepOrder = this.stepsList.length + 1;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'حدث خطأ أثناء تحميل خطوات الخدمة';
        this.isLoading = false;
      }
    });
  }

  // --------------------------------------------------------
  // POST — إضافة خطوة جديدة
  // --------------------------------------------------------
  addStep(): void {
    if (!this.selectedServiceId) {
      this.errorMsg = 'اختر خدمة قبل إضافة الخطوة';
      return;
    }

    const title = this.newStep.title.trim();
    if (!title || this.isAdding) return;

    this.isAdding = true;

    this.http.post<ApiResponse<ServiceStep>>(this.stepsUrl, {
      title,
      stepOrder: this.newStep.stepOrder
    }).subscribe({
      next: (res) => {
        if (res?.data) {
          this.stepsList.push(res.data);
        } else {
          this.loadSteps();
        }
        this.stepsList.sort((a, b) => a.stepOrder - b.stepOrder);
        this.newStep.title = '';
        this.newStep.stepOrder = this.stepsList.length + 1;
        this.isAdding = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'حدث خطأ أثناء إضافة الخطوة';
        this.isAdding = false;
      }
    });
  }

  // --------------------------------------------------------
  // Edit Modal
  // --------------------------------------------------------
  showEditModal = false;
  selectedStep: ServiceStep | null = null;
  editTitle = '';
  editOrder = 1;
  isSaving = false;

  openEdit(step: ServiceStep): void {
    this.selectedStep = step;
    this.editTitle = step.title;
    this.editOrder = step.stepOrder;
    this.showEditModal = true;
  }

  closeEdit(): void {
    this.showEditModal = false;
    this.selectedStep = null;
  }

  // PUT — حفظ تعديل الخطوة
  saveEdit(): void {
    const title = this.editTitle.trim();
    if (!title || !this.selectedStep || this.isSaving) return;

    const id = this.selectedStep.id;
    this.isSaving = true;

    this.http.put<ApiResponse<ServiceStep>>(`${this.stepsUrl}/${id}`, {
      title,
      stepOrder: this.editOrder
    }).subscribe({
      next: (res) => {
        const idx = this.stepsList.findIndex(s => s.id === id);
        if (idx > -1) {
          this.stepsList[idx] = res?.data ?? { ...this.stepsList[idx], title, stepOrder: this.editOrder };
        }
        this.stepsList.sort((a, b) => a.stepOrder - b.stepOrder);
        this.isSaving = false;
        this.closeEdit();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'حدث خطأ أثناء تعديل الخطوة';
        this.isSaving = false;
      }
    });
  }

  // --------------------------------------------------------
  // Delete Modal
  // --------------------------------------------------------
  showDeleteModal = false;
  isDeleting = false;

  openDelete(step: ServiceStep): void {
    this.selectedStep = step;
    this.showDeleteModal = true;
  }

  closeDelete(): void {
    this.showDeleteModal = false;
    this.selectedStep = null;
  }

  // DELETE — حذف خطوة بعد التأكيد
  confirmDelete(): void {
    if (!this.selectedStep || this.isDeleting) return;

    const id = this.selectedStep.id;
    this.isDeleting = true;

    this.http.delete<ApiResponse<null>>(`${this.stepsUrl}/${id}`).subscribe({
      next: () => {
        this.stepsList = this.stepsList.filter(s => s.id !== id);
        this.isDeleting = false;
        this.closeDelete();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'حدث خطأ أثناء حذف الخطوة';
        this.isDeleting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
