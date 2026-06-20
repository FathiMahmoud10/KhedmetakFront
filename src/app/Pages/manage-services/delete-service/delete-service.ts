import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GovServiceAdminService } from '../../../APIServices/SharedServices/gov-service-admin.service';
import { GovServicesService } from '../../../APIServices/SharedServices/gov-services-service';
import { CategoryAPI } from '../../../APIServices/SharedServices/category-api';
import { IService } from '../../../Utilities/Interfaces/IService';
import { CategoryDto } from '../../../Utilities/Interfaces/ICategory';

// نفس خريطة الأيقونات المستخدمة في صفحة إدارة الخدمات، عشان كارت المعاينة
// هنا يطابق شكل الكروت الأصلية بصريًا.
const CATEGORY_ICONS: Record<string, string> = {
  'المرور': 'fa-car',
  'الأحوال المدنية': 'fa-id-card',
  'الشهر العقاري': 'fa-file-signature',
  'الجوازات والهجرة': 'fa-passport',
};

type PageState = 'loading' | 'confirm' | 'deleting' | 'success' | 'error' | 'not-found';

@Component({
  selector: 'app-delete-service',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './delete-service.html',
  styleUrls: ['../manage-services.scss']
})
export class DeleteService implements OnInit {

  state: PageState = 'loading';
  errorMessage: string | null = null;

  service: IService | null = null;
  categories: CategoryDto[] = [];

  private serviceId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: GovServiceAdminService,
    private govServicesService: GovServicesService,
    private categoryApi: CategoryAPI
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.serviceId = Number(idParam);

    if (!idParam || Number.isNaN(this.serviceId)) {
      this.state = 'not-found';
      return;
    }

    this.loadService();
  }

  // تحميل بيانات الخدمة المطلوب حذفها بالإضافة للتصنيفات، عشان نعرض اسم
  // التصنيف بشكل صحيح في كارت المعاينة قبل التأكيد
  private loadService(): void {
    this.state = 'loading';
    this.errorMessage = null;

    this.govServicesService.getAllServices().subscribe({
      next: (services) => {
        const found = services.find(s => s.id === this.serviceId) ?? null;

        if (!found) {
          this.state = 'not-found';
          return;
        }

        this.service = found;

        this.categoryApi.getAllCategories().subscribe({
          next: (cats) => {
            this.categories = cats;
            this.state = 'confirm';
          },
          error: () => {
            // حتى لو فشل تحميل التصنيفات، نقدر نكمل عرض التأكيد بدون اسم التصنيف
            this.state = 'confirm';
          }
        });
      },
      error: (err) => {
        this.state = 'error';
        this.errorMessage = err?.error?.message || 'تعذّر تحميل بيانات الخدمة المطلوبة.';
      }
    });
  }

  getCategoryName(categoryId: number | undefined): string {
    if (!categoryId) return 'غير مصنّف';
    return this.categories.find(c => c.id === categoryId)?.name ?? 'غير مصنّف';
  }

  getCategoryIcon(categoryId: number | undefined): string {
    const name = this.getCategoryName(categoryId);
    return CATEGORY_ICONS[name] ?? 'fa-concierge-bell';
  }

  // تنفيذ الحذف الفعلي بعد تأكيد المستخدمة
  confirmDelete(): void {
    if (!this.service) return;

    this.state = 'deleting';
    this.errorMessage = null;

    this.adminService.deleteService(this.service.id).subscribe({
      next: () => {
        this.state = 'success';
      },
      error: (err) => {
        this.state = 'error';
        this.errorMessage =
          err?.error?.message || 'تعذّر حذف الخدمة، الرجاء المحاولة مرة أخرى.';
      }
    });
  }

  // الرجوع لصفحة إدارة الخدمات بدون حذف أي شيء
  goBack(): void {
    this.router.navigate(['/manage-services']);
  }

  retry(): void {
    this.loadService();
  }
}
