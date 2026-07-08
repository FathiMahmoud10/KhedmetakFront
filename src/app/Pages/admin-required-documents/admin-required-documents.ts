import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../APIServices/SharedServices/admin';
import { GovServicesService } from '../../APIServices/SharedServices/gov-services-service'; // مستخدمة فقط لجلب قائمة الخدمات العامة
import { IService } from '../../Utilities/Interfaces/IService';

export interface RequiredDocumentDto {
  id: number;
  documentName: string;
  isMandatory: boolean;
  documentType: number;
  standardDocument?: any;
}

export interface CreateRequiredDocumentDto {
  documentName: string;
  isMandatory: boolean;
  documentType: number;
}

export interface UpdateRequiredDocumentDto {
  documentName: string;
  isMandatory: boolean;
  documentType: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  'المرور': 'fa-car',
  'الأحوال المدنية': 'fa-id-card',
  'الشهر العقاري': 'fa-file-signature',
  'الجوازات والهجرة': 'fa-passport',
  'الجوازات': 'fa-passport',
  'أحوال مدنية': 'fa-id-card',
  'التعليم': 'fa-graduation-cap',
  'الصحة': 'fa-hospital',
  'التموين': 'fa-shopping-basket',
  'مصالح حكومية': 'fa-landmark',
};

@Component({
  selector: 'app-admin-required-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-required-documents.html',
  styleUrls: ['./admin-required-documents.scss']
})
export class AdminRequiredDocumentsComponent implements OnInit {

  // ==========================================
  // القوائم والمؤشرات الأساسية
  // ==========================================
  services: IService[] = [];
  isLoadingServices = true;
  loadErrorMessage: string | null = null;

  selectedServiceId: number | null = null;

  documents: RequiredDocumentDto[] = [];
  isLoadingDocs = false;
  docsErrorMessage: string | null = null;

  // نماذج الإدخال والتعديل والحذف
  newDoc: CreateRequiredDocumentDto = {
    documentName: '',
    isMandatory: true,
    documentType: 3
  };
  newDocFile: File | null = null;
  newDocRule: string = '';

  isSaving = false;
  formSuccessMessage: string | null = null;
  formErrorMessage: string | null = null;

  showEditModal = false;
  editingDoc: RequiredDocumentDto | null = null;

  editDocForm: UpdateRequiredDocumentDto = {
    documentName: '',
    isMandatory: true,
    documentType: 3
  };
  editDocFile: File | null = null;
  editDocRule: string = '';

  isSavingEdit = false;
  editErrorMessage: string | null = null;

  showDeleteModal = false;
  selectedDoc: RequiredDocumentDto | null = null;

  isDeleting = false;
  deleteErrorMessage: string | null = null;

  // حقن السيرفس العامة المشتركة، وحقن الـ AdminService الموحدة الخاصة بكِ
  constructor(
    private govServicesService: GovServicesService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  get selectedService(): IService | null {
    if (!this.selectedServiceId) {
      return null;
    }
    return this.services.find(s => s.id === Number(this.selectedServiceId)) ?? null;
  }

  // ==========================================
  // جلب الخدمات العامة لتهيئة الـ Dropdown
  // ==========================================
  loadServices(): void {
    this.isLoadingServices = true;
    this.govServicesService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
        this.isLoadingServices = false;
      },
      error: (err) => {
        this.isLoadingServices = false;
        this.loadErrorMessage = err?.error?.message ?? 'تعذر تحميل قائمة الخدمات الحكومية.';
      }
    });
  }

  // ==========================================
  // معالجة تغيير اختيار الخدمة من القائمة
  // ==========================================
  onServiceChange(serviceId: number | null): void {
    this.selectedServiceId = serviceId ? Number(serviceId) : null;
    this.documents = [];
    this.docsErrorMessage = null;
    this.formSuccessMessage = null;
    this.formErrorMessage = null;
    this.resetNewDocForm();

    if (this.selectedServiceId) {
      this.loadDocuments();
    }
  }

  // ==========================================
  // جلب المستندات المطلوبة للخدمة عبر الـ AdminService الخاصة بكِ
  // ==========================================
  loadDocuments(): void {
    if (!this.selectedServiceId) return;

    this.isLoadingDocs = true;
    this.docsErrorMessage = null;

    this.adminService.getRequiredDocuments(this.selectedServiceId).subscribe({
      next: (response: any) => {
        this.isLoadingDocs = false;
        // معالجة رد السيرفر بمرونة (سواء أكان مغلّفاً بـ Response Object أو Array مباشرة)
        if (response?.success || Array.isArray(response?.data) || response) {
          this.documents = response?.data ?? response ?? [];
        } else {
          this.docsErrorMessage = response?.message ?? 'حدث خطأ أثناء جلب المستندات.';
        }
      },
      error: (err) => {
        this.isLoadingDocs = false;
        this.docsErrorMessage = err?.error?.message ?? 'تعذر الاتصال بالخادم لجلب المستندات.';
      }
    });
  }

  // ==========================================
  // إضافة مستند جديد للخدمة المحددة عبر الـ AdminService
  // ==========================================
  onNewFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.newDocFile = file;
    }
  }

  onEditFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.editDocFile = file;
    }
  }

  saveDocument(): void {
    this.formSuccessMessage = null;
    this.formErrorMessage = null;

    if (!this.newDoc.documentName.trim()) {
      this.formErrorMessage = 'من فضلك أدخل اسم المستند أولاً.';
      return;
    }

    if (!this.selectedServiceId) return;

    this.isSaving = true;

    const formData = new FormData();
    formData.append('documentName', this.newDoc.documentName);
    formData.append('isMandatory', String(this.newDoc.isMandatory));
    formData.append('documentType', String(this.newDoc.documentType));
    if (this.newDocFile) {
      formData.append('standardDocumentFile', this.newDocFile);
    }
    if (this.newDocRule) {
      formData.append('generalRule', this.newDocRule);
    }

    this.adminService.createRequiredDocument(this.selectedServiceId, formData).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        if (response?.success || response?.id || response) {
          this.formSuccessMessage = 'تم إضافة المستند بنجاح لبيانات الخدمة.';
          this.resetNewDocForm();
          this.loadDocuments();
        } else {
          this.formErrorMessage = response?.message ?? 'حدث خطأ أثناء إرسال البيانات.';
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.formErrorMessage = err?.error?.message ?? 'تعذر الاتصال بالخادم، لم يتم الحفظ.';
      }
    });
  }

  resetNewDocForm(): void {
    this.newDoc = {
      documentName: '',
      isMandatory: true,
      documentType: 3
    };
    this.newDocFile = null;
    this.newDocRule = '';
  }

  openEdit(doc: RequiredDocumentDto): void {
    this.editingDoc = doc;
    this.editDocForm = {
      documentName: doc.documentName,
      isMandatory: doc.isMandatory,
      documentType: doc.documentType
    };
    this.editDocFile = null;
    this.editDocRule = doc.standardDocument?.generalRule ?? '';
    this.editErrorMessage = null;
    this.showEditModal = true;
  }

  closeEdit(): void {
    if (this.isSavingEdit) return;
    this.showEditModal = false;
    this.editingDoc = null;
  }

  // ==========================================
  // حفظ تعديل بيانات مستند عبر الـ AdminService
  // ==========================================
  saveEdit(): void {
    if (!this.selectedServiceId || !this.editingDoc) return;

    this.isSavingEdit = true;
    this.editErrorMessage = null;

    const formData = new FormData();
    formData.append('documentName', this.editDocForm.documentName);
    formData.append('isMandatory', String(this.editDocForm.isMandatory));
    formData.append('documentType', String(this.editDocForm.documentType));
    if (this.editDocFile) {
      formData.append('standardDocumentFile', this.editDocFile);
    }
    if (this.editDocRule) {
      formData.append('generalRule', this.editDocRule);
    }

    this.adminService.updateRequiredDocument(this.selectedServiceId, this.editingDoc.id, formData).subscribe({
      next: (response: any) => {
        this.isSavingEdit = false;
        if (response?.success || response?.id || response) {
          this.showEditModal = false;
          this.editingDoc = null;
          this.loadDocuments();
        } else {
          this.editErrorMessage = response?.message ?? 'حدث خطأ أثناء تعديل المستند.';
        }
      },
      error: (err) => {
        this.isSavingEdit = false;
        this.editErrorMessage = err?.error?.message ?? 'تعذر الاتصال بالخادم، لم يتم حفظ التعديل.';
      }
    });
  }

  openDelete(doc: RequiredDocumentDto): void {
    this.selectedDoc = doc;
    this.showDeleteModal = true;
    this.deleteErrorMessage = null;
  }

  closeDelete(): void {
    if (this.isDeleting) return;
    this.showDeleteModal = false;
    this.selectedDoc = null;
  }

  // ==========================================
  // تأكيد وحذف المستند نهائياً عبر الـ AdminService
  // ==========================================
  confirmDelete(): void {
    if (!this.selectedServiceId || !this.selectedDoc) return;

    const docId = this.selectedDoc.id;
    this.isDeleting = true;
    this.deleteErrorMessage = null;

    this.adminService.deleteRequiredDocument(this.selectedServiceId, docId).subscribe({
      next: (response: any) => {
        this.isDeleting = false;
        if (response?.success || response) {
          this.documents = this.documents.filter(d => d.id !== docId);
          this.showDeleteModal = false;
          this.selectedDoc = null;
        } else {
          this.deleteErrorMessage = response?.message ?? 'حدث خطأ أثناء عملية الحذف.';
        }
      },
      error: (err) => {
        this.isDeleting = false;
        this.deleteErrorMessage = err?.error?.message ?? 'تعذر الاتصال بالخادم لحذف المستند.';
      }
    });
  }

  getCategoryIcon(categoryId: number): string {
    const service = this.services.find(s => s.categoryId === categoryId);
    return CATEGORY_ICONS[service?.categoryName ?? ''] ?? 'fa-concierge-bell';
  }
}
