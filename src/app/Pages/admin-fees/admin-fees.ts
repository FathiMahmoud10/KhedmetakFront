import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovServicesService } from '../../APIServices/SharedServices/gov-services-service';
import { AdminService } from '../../APIServices/SharedServices/admin'; // استدعاء الخدمة الخاصة بكِ
import { IService } from '../../Utilities/Interfaces/IService';

export interface UpdateFeesDto {
  srvFees: number;
  estimatedFees: number;
}

// أيقونات التصنيفات المستعارة من FontAwesome بناءً على اسم القسم الحكومي
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
  selector: 'app-admin-fees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-fees.html',
  styleUrls: ['./admin-fees.scss']
})
export class AdminFeesComponent implements OnInit {

  // ==========================================
  // القوائم والمؤشرات الأساسية (State Management)
  // ==========================================
  services: IService[] = [];
  isLoadingServices = true;
  loadErrorMessage: string | null = null;

  // الخدمة التي يقوم الإدمن بتحديدها حالياً من القائمة المنسدلة
  selectedService: IService | null = null;

  // بيانات نموذج إدخال الرسوم وتعديلها المرتبطة بالـ HTML
  feesForm: UpdateFeesDto = {
    srvFees: 0,
    estimatedFees: 0
  };

  // مؤشرات التفاعل أثناء إرسال البيانات إلى السيرفر
  isSaving = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // حقن كلا الخدمتين: خدمة جلب القوائم العامة، وخدمة الإدارة الخاصة بكِ للتحديث
  constructor(
    private govServicesService: GovServicesService,
    private adminService: AdminService 
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  // ==========================================
  // دالة التحقق من وجود تعديلات (Computed Property)
  // ==========================================
  get hasDiff(): boolean {
    if (!this.selectedService) {
      return false;
    }

    return (
      this.feesForm.srvFees !== this.selectedService.srvFees ||
      this.feesForm.estimatedFees !== this.selectedService.estimatedFees
    );
  }

  // ==========================================
  // جلب كافة الخدمات المتاحة من السيرفر
  // ==========================================
  loadServices(): void {
    this.isLoadingServices = true;
    this.loadErrorMessage = null;

    this.govServicesService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
        this.isLoadingServices = false;
      },
      error: (err) => {
        this.isLoadingServices = false;
        this.loadErrorMessage =
          err?.error?.message ||
          'تعذّر تحميل قائمة الخدمات من الخادم.';
      }
    });
  }

  // ==========================================
  // معالجة تغيير الخدمة المختارة من القائمة
  // ==========================================
  onServiceChange(serviceId: number | null): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (!serviceId) {
      this.selectedService = null;
      return;
    }

    // العثور على كائن الخدمة ومطابقته رقمياً لضمان سلامة البحث بالـ ID
    const service =
      this.services.find(s => s.id === Number(serviceId)) ?? null;

    this.selectedService = service;

    if (service) {
      this.feesForm = {
        srvFees: service.srvFees ?? 0,
        estimatedFees: service.estimatedFees ?? 0
      };
    }
  }

  // ==========================================
  // إعادة تعيين قيم النموذج إلى قيمها الأصلية
  // ==========================================
  resetForm(): void {
    if (!this.selectedService) {
      return;
    }

    this.feesForm = {
      srvFees: this.selectedService.srvFees ?? 0,
      estimatedFees: this.selectedService.estimatedFees ?? 0
    };

    this.successMessage = null;
    this.errorMessage = null;
  }

  // ==========================================
  // حفظ وتحديث الرسوم في الباك إند
  // ==========================================
  saveFees(): void {
    // التحقق الفوري والآمن من وجود الخدمة والمعرف الخاص بها قبل الاستدعاء
    if (
      !this.selectedService ||
      !this.selectedService.id ||
      this.isSaving
    ) {
      return;
    }

    this.successMessage = null;
    this.errorMessage = null;

    // منع إدخال قيم سالبة للرسوم
    if (
      this.feesForm.srvFees < 0 ||
      this.feesForm.estimatedFees < 0
    ) {
      this.errorMessage = 'الرسوم لا يمكن أن تكون بالسالب.';
      return;
    }

    this.isSaving = true;

    // التعديل هنا ليقوم بالاتصال بالـ AdminService الموحدة الخاصة بكِ
    this.adminService
      .updateFees(
        this.selectedService.id,
        this.feesForm
      )
      .subscribe({
        next: (response: any) => {
          this.isSaving = false;

          // معالجة مرنة وشاملة لردود السيرفر باختلاف تصميم الـ API المقابل
          if (response?.success || response?.id || response) {
            this.successMessage = 'تم تحديث الرسوم بنجاح.';

            // تحديث بيانات الخدمة محلياً بالقيم المرجعة أو المدخلة لتعكس التحديث على الشاشة مباشرة
            const updatedSrvFees = response?.data?.srvFees ?? this.feesForm.srvFees;
            const updatedEstimatedFees = response?.data?.estimatedFees ?? this.feesForm.estimatedFees;

            this.selectedService = {
              ...this.selectedService!,
              srvFees: updatedSrvFees,
              estimatedFees: updatedEstimatedFees
            };

            const index = this.services.findIndex(
              s => s.id === this.selectedService!.id
            );

            if (index !== -1) {
              this.services[index] = {
                ...this.services[index],
                srvFees: updatedSrvFees,
                estimatedFees: updatedEstimatedFees
              };
            }
          } else {
            this.errorMessage =
              response?.message ||
              'حدث خطأ أثناء تحديث الرسوم.';
          }
        },
        error: (err) => {
          this.isSaving = false;
          this.errorMessage =
            err?.error?.message ||
            'تعذّر الاتصال بالخادم، الرجاء المحاولة مرة أخرى.';
        }
      });
  }

  // ==========================================
  // جلب الأيقونة المناسبة للتصنيف الحكومي
  // ==========================================
  getCategoryIcon(categoryId: number): string {
    const service =
      this.services.find(
        s => s.categoryId === categoryId
      );

    return (
      CATEGORY_ICONS[
        service?.categoryName ?? ''
      ] ?? 'fa-concierge-bell'
    );
  }
}
