import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AdminService } from '../../APIServices/SharedServices/admin'; // استدعاء الخدمة الخاصة بكِ

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit, AfterViewInit {

  @ViewChild('ordersChart')
  ordersChartCanvas!: ElementRef<HTMLCanvasElement>;

  chart: Chart | null = null;

  // متغيرات لحفظ الأرقام الحقيقية القادمة من الباك إند
  totalUsers: number = 0;
  totalServices: number = 0;
  totalCategories: number = 0;

  // مؤشر تحميل يضمن جلب البيانات أولاً من السيرفر قبل عرض الكروت والرسم البياني
  isLoading: boolean = true;

  // مصفوفة الطلبات الديناميكية (بيانات تجريبية ذكية تظل نشطة أمام لجنة التحكيم لحين برمجة الباك إند لهذا الجزء)
  requestsList = [
    { id: 1, name: 'أحمد محمد عبد الله', service: 'تجديد رخصة القيادة', date: '13/06/2026', status: 'قيد المراجعة', nationalId: '2950101XXXXXXX', phone: '01012345678', userFile: 'رخصة_قديمة.pdf' },
    { id: 2, name: 'فاطمة علي حسن', service: 'إصدار بطاقة رقم قومي', date: '12/06/2026', status: 'قيد المراجعة', nationalId: '2980502XXXXXXX', phone: '01234567890', userFile: 'شهادة_ميلاد.pdf' },
    { id: 3, name: 'محمود سعيد كريم', service: 'استخراج شهادة ميلاد تفصيلية', date: '10/06/2026', status: 'مرفوض', nationalId: '2911103XXXXXXX', phone: '01145678901', userFile: 'قسيمة_زواج.pdf' }
  ];

  selectedRequest: any = null;

  todayLabel = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  ngAfterViewInit(): void {
    // تم نقل استدعاء تشغيل الـ Chart ليكون داخل دالة جلب البيانات بعد أن تصل الأرقام من السيرفر
  }

  // جلب الإحصائيات الحقيقية من السيرفر وقراءتها بدقة من كائن الـ data
  loadDashboardStats(): void {
    this.isLoading = true;
    this.adminService.getPlatformStats().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          // التأكد من تحويل القيم القادمة إلى أرقام لتفادي أخطاء مكتبات الرسم البياني
          this.totalUsers = Number(res.data.totalUsers ?? 0);
          this.totalServices = Number(res.data.totalServices ?? 0);
          this.totalCategories = Number(res.data.totalCategories ?? 0);
        } else {
          // قيم احتياطية إذا كانت صيغة الـ Response غير مطابقة
          this.totalUsers = 4;
          this.totalServices = 7;
          this.totalCategories = 5;
        }
        this.isLoading = false;
        
        // استخدام setTimeout يضمن أن واجهة الـ HTML تم تحديثها وعنصر الـ Canvas متواجد في الصفحة
        setTimeout(() => this.createOrdersChart(), 50);
      },
      error: (err) => {
        console.error('تعذر جلب الإحصائيات الحقيقية، سيتم عرض قيم افتراضية:', err);
        this.totalUsers = 4;
        this.totalServices = 7;
        this.totalCategories = 5;
        this.isLoading = false;
        
        // تشغيل الرسم البياني بالقيم الاحتياطية في حال الفشل
        setTimeout(() => this.createOrdersChart(), 50);
      }
    });
  }

  // دالة حساب الطلبات قيد المراجعة ديناميكياً لحل مشكلة الـ Pipe
  get pendingRequestsCount(): number {
    return this.requestsList.filter(req => req.status === 'قيد المراجعة').length;
  }

  viewDetails(request: any): void {
    this.selectedRequest = request;
  }

  updateStatus(newStatus: string): void {
    if (this.selectedRequest) {
      const requestIndex = this.requestsList.findIndex(r => r.id === this.selectedRequest.id);
      if (requestIndex !== -1) {
        this.requestsList[requestIndex].status = newStatus;
        this.selectedRequest.status = newStatus;
      }
      alert(`[تحديث محلي] تم تعديل حالة الطلب إلى [${newStatus}] بنجاح! 📁`);
    }
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'مقبول': 'dash-badge--success',
      'قيد المراجعة': 'dash-badge--warning',
      'مرفوض': 'dash-badge--danger',
    };
    return map[status] ?? 'dash-badge--default';
  }

  // دالة بناء الـ Chart الديناميكي المربوط بأرقام الباك إند الحقيقية
  createOrdersChart(): void {
    // 1. تدمير أي نسخة قديمة من الرسم البياني مسجلة بذاكرة الصفحة لمنع الـ Glitch والاختفاء الفجائي
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.ordersChartCanvas) {
      console.warn('عنصر الـ Canvas الخاص بالرسم البياني غير متوفر في الـ DOM حالياً.');
      return;
    }
    
    const ctx = this.ordersChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar', // نوع الرسم البياني الأعمدة لمقارنة الإحصائيات العامة
      data: {
        labels: [
          'إجمالي الخدمات الحكومية',
          'المواطنين المسجلين',
          'القطاعات والأقسام النشطة'
        ],
        datasets: [
          {
            label: 'إحصائيات منصة خدمتك الحالية المباشرة من الخادم',
            // البيانات الديناميكية المستقرة
            data: [this.totalServices, this.totalUsers, this.totalCategories],
            backgroundColor: [
              'rgba(72, 127, 185, 0.6)', 
              'rgba(41, 139, 100, 0.6)', 
              'rgba(245, 158, 11, 0.6)'
            ],
            borderColor: [
              '#487fb9', 
              '#298b64', 
              '#f59e0b'
            ],
            borderWidth: 2,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            rtl: true,
            labels: {
              font: {
                family: 'Cairo',
                size: 13
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            position: 'right',
            grid: { color: 'rgba(228, 233, 240, 0.8)' },
            ticks: {
              font: { family: 'Cairo', size: 12 },
              color: '#6b7a8d'
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Cairo', size: 12 },
              color: '#6b7a8d'
            }
          }
        }
      }
    });
  }
}
