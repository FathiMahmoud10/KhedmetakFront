import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';

import { CommonModule} from '@angular/common';
import { Chart, registerables } from 'chart.js';

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

  chart!: Chart;

  // 1. مصفوفة الطلبات الديناميكية لتحديث جدول واجهة الأدمن فوراً عند القبول أو الرفض
  requestsList = [
    { id: 1, name: 'أحمد محمد عبد الله', service: 'تجديد رخصة القيادة', date: '13/06/2026', status: 'قيد المراجعة', nationalId: '2950101XXXXXXX', phone: '01012345678', userFile: 'رخصة_قديمة.pdf' },
    { id: 2, name: 'فاطمة علي حسن', service: 'إصدار بطاقة رقم قومي', date: '12/06/2026', status: 'قيد المراجعة', nationalId: '2980502XXXXXXX', phone: '01234567890', userFile: 'شهادة_ميلاد.pdf' },
    { id: 3, name: 'محمود سعيد كريم', service: 'استخراج شهادة ميلاد تفصيلية', date: '10/06/2026', status: 'مرفوض', nationalId: '2911103XXXXXXX', phone: '01145678901', userFile: 'قسيمة_زواج.pdf' }
  ];

  // 2. متغير لحمل وتمرير بيانات الطلب الذي يختاره الأدمن حالياً لعرضه في الـ Modal
  selectedRequest: any = null;

  todayLabel = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.createOrdersChart();
  }

  // 3. دالة تُنفذ عند الضغط على "عرض التفاصيل" لتحديد السطر المطلوب
  viewDetails(request: any): void {
    this.selectedRequest = request;
  }

  // 4. دالة تعديل حالة الطلب لـ (مقبول / مرفوض) ومزامنتها على الشاشة تلقائياً
  updateStatus(newStatus: string): void {
    if (this.selectedRequest) {
      const requestIndex = this.requestsList.findIndex(r => r.id === this.selectedRequest.id);
      if (requestIndex !== -1) {
        this.requestsList[requestIndex].status = newStatus;
        this.selectedRequest.status = newStatus;
      }
      alert(`تم تعديل حالة الطلب إلى [${newStatus}] بنجاح! 📁`);
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

  createOrdersChart(): void {
    const ctx = this.ordersChartCanvas.nativeElement.getContext('2d');

    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [
          'السبت',
          'الأحد',
          'الإثنين',
          'الثلاثاء',
          'الأربعاء',
          'الخميس',
          'الجمعة'
        ],
        datasets: [
          {
            label: 'معدل الطلبات الحكومية المستلمة',
            data: [120, 150, 180, 220, 190, 250, 300],
            backgroundColor: 'rgba(72, 127, 185, 0.12)',
            borderColor: '#487fb9',
            borderWidth: 2.5,
            pointBackgroundColor: '#298b64',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true
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
