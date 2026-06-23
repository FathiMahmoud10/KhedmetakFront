import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  GovServiceAdminService,
  ImportServicesResultDto,
  CreateGovServiceDto,
  UpdateGovServiceDto
} from '../../APIServices/SharedServices/gov-service-admin.service';
import { GovServicesService } from '../../APIServices/SharedServices/gov-services-service';
import { CategoryAPI } from '../../APIServices/SharedServices/category-api';
import { IService } from '../../Utilities/Interfaces/IService';
import { CategoryDto } from '../../Utilities/Interfaces/ICategory';

// أيقونة افتراضية مرتبطة باسم كل تصنيف (بتتحدّث تلقائيًا لو ظهر تصنيف جديد من الباك إند)
const CATEGORY_ICONS: Record<string, string> = {
  'المرور': 'fa-car',
  'الأحوال المدنية': 'fa-id-card',
  'الشهر العقاري': 'fa-file-signature',
  'الجوازات والهجرة': 'fa-passport',
};

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manage-services.html',
  styleUrls: ['./manage-services.scss']
})
export class ManageServices implements OnInit {

  // ----------------- بيانات حقيقية من الباك إند -----------------
  servicesList: IService[] = [];
  categories: CategoryDto[] = [];

  isLoading = true;
  loadErrorMessage: string | null = null;

  // ----------------- نموذج إضافة / تعديل خدمة -----------------
  newService = {
    title: '',
    categoryId: 0,
    description: '',
    srvFees: 0,
    srvTime: '',
    estimatedFees: 0
  };

  isSaving = false;

  // رسائل تنبيه داخل الصفحة بدل alert()
  formSuccessMessage: string | null = null;
  formErrorMessage: string | null = null;

  // ----------------- تبويبات التصنيف (فلترة الكروت) -----------------
  // 0 = "الكل" (تعرض كل الخدمات وهي المختارة بشكل افتراضي)
  activeCategoryId = 0;

  selectCategoryTab(categoryId: number): void {
    this.activeCategoryId = categoryId;
  }

  get filteredServicesList(): IService[] {
    if (!this.activeCategoryId) {
      return this.servicesList;
    }
    return this.servicesList.filter(s => s.categoryId === this.activeCategoryId);
  }

  getCategoryCount(categoryId: number): number {
    return this.servicesList.filter(s => s.categoryId === categoryId).length;
  }

  // ---------------- استيراد ملف الإكسل ----------------
  selectedExcelFile: File | null = null;
  isImporting = false;
  importResult: ImportServicesResultDto | null = null;
  importErrorMessage: string | null = null;

  constructor(
    private adminService: GovServiceAdminService,
    private govServicesService: GovServicesService,
    private categoryApi: CategoryAPI
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  // تحميل الخدمات والتصنيفات سوا من الباك إند الحقيقي
  loadInitialData(): void {
    this.isLoading = true;
    this.loadErrorMessage = null;

    forkJoin({
      services: this.govServicesService.getAllServices(),
      categories: this.categoryApi.getAllCategories()
    }).subscribe({
      next: ({ services, categories }) => {
        this.servicesList = services;
        this.categories = categories;

        if (!this.newService.categoryId && categories.length > 0) {
          this.newService.categoryId = categories[0].id;
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.loadErrorMessage =
          err?.error?.message || 'تعذّر تحميل بيانات الخدمات والتصنيفات من الخادم.';
      }
    });
  }

  // اسم التصنيف من الـ id (للعرض على الكارت)
  getCategoryName(categoryId: number): string {
    return this.categories.find(c => c.id === categoryId)?.name ?? 'غير مصنّف';
  }

  getCategoryIcon(categoryId: number): string {
    const name = this.getCategoryName(categoryId);
    return CATEGORY_ICONS[name] ?? 'fa-concierge-bell';
  }

  getCategoryClass(categoryId: number): string {
    const map: Record<string, string> = {
      'المرور': 'ms-card--traffic',
      'الأحوال المدنية': 'ms-card--civil',
      'الشهر العقاري': 'ms-card--realestate',
      'الجوازات والهجرة': 'ms-card--passport',
    };
    return map[this.getCategoryName(categoryId)] ?? 'ms-card--default';
  }

  // ----------------- إضافة خدمة جديدة -----------------

  saveService(): void {
    this.formSuccessMessage = null;
    this.formErrorMessage = null;

    if (
      !this.newService.title.trim() ||
      !this.newService.description.trim() ||
      !this.newService.categoryId ||
      !this.newService.srvTime.trim() ||
      this.newService.srvFees < 0 ||
      this.newService.estimatedFees < 0
    ) {
      this.formErrorMessage = 'من فضلك املأ جميع الحقول المطلوبة أولاً (الاسم، الفئة، الوصف، الرسوم، ومدة التنفيذ).';
      return;
    }

    const dto: CreateGovServiceDto = {
      srvName: this.newService.title.trim(),
      srvDesc: this.newService.description.trim(),
      categoryId: this.newService.categoryId,
      srvFees: this.newService.srvFees,
      srvTime: this.newService.srvTime.trim(),
      estimatedFees: this.newService.estimatedFees
    };

    this.isSaving = true;

    this.adminService.createService(dto).subscribe({
      next: () => {
        this.isSaving = false;
        this.formSuccessMessage = 'تم إضافة الخدمة الحكومية الجديدة بنجاح.';
        this.resetForm();
        this.loadInitialData();
      },
      error: (err) => {
        this.isSaving = false;
        this.formErrorMessage =
          err?.error?.message || 'حدث خطأ أثناء حفظ الخدمة، الرجاء المحاولة مرة أخرى.';
      }
    });
  }

  private resetForm(): void {
    this.newService = {
      title: '',
      categoryId: this.categories[0]?.id ?? 0,
      description: '',
      srvFees: 0,
      srvTime: '',
      estimatedFees: 0
    };
  }

  // ----------------- تعديل خدمة (Pop-up مودال زي إدارة الفئات) -----------------
  showEditModal = false;
  editingService: IService | null = null;
  editServiceForm = {
    title: '',
    categoryId: 0,
    description: '',
    srvFees: 0,
    srvTime: '',
    estimatedFees: 0
  };
  isSavingEdit = false;
  editErrorMessage: string | null = null;

  openEdit(svc: IService): void {
    this.editingService = svc;
    this.editServiceForm = {
      title: svc.srvName,
      categoryId: svc.categoryId,
      description: svc.srvDesc,
      srvFees: svc.srvFees ?? 0,
      srvTime: svc.srvTime ?? '',
      estimatedFees: svc.estimatedFees ?? 0
    };
    this.editErrorMessage = null;
    this.showEditModal = true;
  }

  closeEdit(): void {
    if (this.isSavingEdit) return;
    this.showEditModal = false;
    this.editingService = null;
    this.editErrorMessage = null;
  }

  saveEdit(): void {
    if (!this.editingService || this.isSavingEdit) return;

    this.editErrorMessage = null;

    if (
      !this.editServiceForm.title.trim() ||
      !this.editServiceForm.description.trim() ||
      !this.editServiceForm.categoryId ||
      !this.editServiceForm.srvTime.trim() ||
      this.editServiceForm.srvFees < 0 ||
      this.editServiceForm.estimatedFees < 0
    ) {
      this.editErrorMessage = 'من فضلك املأ جميع الحقول المطلوبة أولاً (الاسم، الفئة، الوصف، الرسوم، ومدة التنفيذ).';
      return;
    }

    const id = this.editingService.id;
    const dto: UpdateGovServiceDto = {
      srvName: this.editServiceForm.title.trim(),
      srvDesc: this.editServiceForm.description.trim(),
      categoryId: this.editServiceForm.categoryId,
      srvFees: this.editServiceForm.srvFees,
      srvTime: this.editServiceForm.srvTime.trim(),
      estimatedFees: this.editServiceForm.estimatedFees
    };

    this.isSavingEdit = true;

    this.adminService.updateService(id, dto).subscribe({
      next: () => {
        this.isSavingEdit = false;
        this.showEditModal = false;
        this.editingService = null;
        this.loadInitialData();
      },
      error: (err) => {
        this.isSavingEdit = false;
        this.editErrorMessage =
          err?.error?.message || 'حدث خطأ أثناء تعديل الخدمة، الرجاء المحاولة مرة أخرى.';
      }
    });
  }

  // ----------------- حذف خدمة (Pop-up مودال زي إدارة الفئات) -----------------
  showDeleteModal = false;
  selectedService: IService | null = null;
  isDeleting = false;
  deleteErrorMessage: string | null = null;

  openDelete(svc: IService): void {
    this.selectedService = svc;
    this.deleteErrorMessage = null;
    this.showDeleteModal = true;
  }

  closeDelete(): void {
    if (this.isDeleting) return;
    this.showDeleteModal = false;
    this.selectedService = null;
    this.deleteErrorMessage = null;
  }

  confirmDelete(): void {
    if (!this.selectedService || this.isDeleting) return;

    const id = this.selectedService.id;
    this.isDeleting = true;
    this.deleteErrorMessage = null;

    this.adminService.deleteService(id).subscribe({
      next: () => {
        this.servicesList = this.servicesList.filter(s => s.id !== id);
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.selectedService = null;
      },
      error: (err) => {
        this.isDeleting = false;
        this.deleteErrorMessage =
          err?.error?.message || 'تعذّر حذف الخدمة، الرجاء المحاولة مرة أخرى.';
      }
    });
  }

  // ---------------- منطق استيراد الإكسل ----------------

  onExcelFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    this.importResult = null;
    this.importErrorMessage = null;

    if (!file) {
      this.selectedExcelFile = null;
      return;
    }

    const allowedExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExtension) {
      this.selectedExcelFile = null;
      this.importErrorMessage = 'نوع الملف غير مدعوم، الرجاء اختيار ملف Excel بصيغة .xlsx أو .xls';
      input.value = '';
      return;
    }

    this.selectedExcelFile = file;
  }

  clearSelectedExcelFile(): void {
    this.selectedExcelFile = null;
    this.importResult = null;
    this.importErrorMessage = null;
  }

  uploadExcelFile(): void {
    if (!this.selectedExcelFile) {
      this.importErrorMessage = 'الرجاء اختيار ملف Excel أولاً.';
      return;
    }

    this.isImporting = true;
    this.importResult = null;
    this.importErrorMessage = null;

    this.adminService.importFromExcel(this.selectedExcelFile).subscribe({
      next: (res) => {
        this.isImporting = false;
        this.importResult = res.data;
        this.selectedExcelFile = null;
        // بعد الاستيراد، أعيدي تحميل قائمة الخدمات عشان تتحدث فورًا
        this.loadInitialData();
      },
      error: (err) => {
        this.isImporting = false;
        this.importErrorMessage =
          err?.error?.message || 'حدث خطأ أثناء رفع الملف، الرجاء المحاولة مرة أخرى.';
      }
    });
  }
}
