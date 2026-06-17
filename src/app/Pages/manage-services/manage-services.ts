import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-services.html',
  styleUrls: ['./manage-services.scss']
})
export class ManageServices  implements OnInit {

  // 1. مصفوفة الخدمات الحالية المتاحة في النظام (بيانات تجريبية تطابق الفئات بمشروعكِ)
  servicesList = [
    { id: 1, title: 'تجديد رخصة القيادة', category: 'المرور', icon: 'fa-car', description: 'تجديد رخصة القيادة الخاصة والمهنية إلكترونياً.' },
    { id: 2, title: 'إصدار بطاقة رقم قومي', category: 'الأحوال المدنية', icon: 'fa-id-card', description: 'طلب استخراج بدل تالف أو فاقد لبطاقة الرقم القومي.' },
    { id: 3, title: 'توثيق عقد بيع', category: 'الشهر العقاري', icon: 'fa-file-signature', description: 'حجز موعد وتوثيق عقود البيع والشراء للمركبات والعقارات.' }
  ];

  // 2. كائن لحمل بيانات الخدمة الجديدة أثناء الكتابة في الاستمارة
  newService = {
    title: '',
    category: 'المرور', // الفئة الافتراضية
    icon: 'fa-concierge-bell',
    description: ''
  };

  constructor() {}

  ngOnInit(): void {}

  // 3. دالة إضافة خدمة جديدة للمصفوفة
  addService(): void {
    if (this.newService.title.trim() && this.newService.description.trim()) {
      // إضافة الخدمة بقيم ديناميكية
      this.servicesList.push({
        id: this.servicesList.length + 1,
        title: this.newService.title,
        category: this.newService.category,
        icon: this.newService.icon,
        description: this.newService.description
      });

      // إعادة تعيين الحقول لتصبح فارغة مجدداً
      this.newService = { title: '', category: 'المرور', icon: 'fa-concierge-bell', description: '' };
      alert('تم إضافة الخدمة الحكومية الجديدة بنجاح! 🚀');
    } else {
      alert('من فضلك املأ جميع الحقول المطلوبة أولاً.');
    }
  }

  // 4. دالة حذف خدمة من النظام
  deleteService(id: number): void {
    if (confirm('هل أنتِ متأكدة من حذف هذه الخدمة نهائياً من النظام؟')) {
      this.servicesList = this.servicesList.filter(service => service.id !== id);
    }
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      'المرور': 'ms-card--traffic',
      'الأحوال المدنية': 'ms-card--civil',
      'الشهر العقاري': 'ms-card--realestate',
      'الجوازات والهجرة': 'ms-card--passport',
    };
    return map[category] ?? 'ms-card--default';
  }
}

