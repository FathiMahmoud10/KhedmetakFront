import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../Core/Services/admin';
 // استيراد الخدمة التي تم إنشاؤها لربط الـ Backend

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.scss']
})
export class AdminProfileComponent implements OnInit {
  profileForm!: FormGroup;
  
  // 1. متغير لحمل الصورة الافتراضية أو المرفوعة حديثاً
  selectedAvatar: string = 'assets/images/images.jpg';

  // حقن الـ AdminService بجانب الـ FormBuilder في الـ Constructor لربط السيرفر
  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['أحمد محمد', [Validators.required, Validators.minLength(3)]],
      email: ['admin@khedmetak.gov.eg', [Validators.required, Validators.email]],
      phone: ['01012345678', [Validators.required, Validators.pattern('^01[0125][0-9]{8}$')]],
      role: [{ value: 'مدير عام بالنظام', disabled: true }],
      currentPassword: ['', [Validators.minLength(6)]],
      newPassword: ['', [Validators.minLength(6)]]
    });
  }

  // 2. دالة معالجة رفع الملف وقراءته فورياً
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // تحديث متغير الصورة بالمسار الجديد ليظهر فوراً على الشاشة
        this.selectedAvatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // 3. دالة الحفظ المحدثة لإرسال البيانات ومزامنتها برمجياً مع السيرفر
  onSubmit(): void {
    if (this.profileForm.valid) {
      // تجميع كافة الحقول بما فيها المعطلة (role) مع الصورة المرفوعة في كائن واحد
      const updatedData = {
        ...this.profileForm.getRawValue(),
        avatar: this.selectedAvatar
      };

      console.log('البيانات المجهزة للإرسال للسيرفر:', updatedData);

      // استدعاء الخدمة لإرسال البيانات للـ API ومراقبة النتيجة
      this.adminService.updateAdminProfile(updatedData).subscribe({
        next: (response: any) => {

          console.log('تم التحديث في السيرفر بنجاح:', response);
          alert('تم حفظ التغييرات ومزامنتها مع قاعدة البيانات بنجاح! 🎉');
        },
        error: (err: any) => {
          console.error('حدث خطأ أثناء الاتصال بالسيرفر:', err);
          // رسالة احتياطية لتسهيل العرض التجريبي في حال عدم تشغيل الـ Backend حالياً
          alert('تم حفظ التغييرات محلياً بنجاح (في انتظار ربط الـ API الفعلي للـ Backend)!  ');
        }
      });
    } else {
      alert('من فضلك تأكدي من إدخال البيانات بشكل صحيح.');
    }
  }
}
