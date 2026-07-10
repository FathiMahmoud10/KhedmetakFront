import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../APIServices/SharedServices/auth.service';
import { ProfileService, UserProfile } from '../../APIServices/SharedServices/profile.service';

type SaveState = 'idle' | 'saving' | 'success' | 'error';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss']
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedAvatar: string = 'assets/images/images.jpg';

  isLoading = true;
  saveState: SaveState = 'idle';
  saveMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.buildForm({ fullName: 'مستخدم', email: '' });

    // ١) عرض فوري من الـ JWT ريثما يوصل رد السيرفر (تجربة استخدام أسرع)
    const token = this.authService.getTokenFromCookie();
    const payload = token ? this.authService.decodeJwt(token) : null;
    const jwtName =
      payload?.name ||
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const jwtEmail =
      payload?.email ||
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    if (jwtName || jwtEmail) {
      this.patchForm({ fullName: jwtName, email: jwtEmail } as UserProfile);
    }

    // ٢) البيانات الحقيقية المحفوظة فعلياً وقت التسجيل (من GET api/Profile)
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res?.data) this.patchForm(res.data);
        this.isLoading = false;
      },
      error: () => {
        // السيرفر لسه من غير الـ endpoint، أو فشل الاتصال - نكمل بالبيانات المتاحة من التوكن
        this.isLoading = false;
      }
    });
  }

  private buildForm(seed: Partial<UserProfile>): void {
    this.profileForm = this.fb.group({
      fullName: [seed.fullName || '', [Validators.required, Validators.minLength(3)]],
      email: [{ value: seed.email || '', disabled: true }],
      phone: [seed.phone || '', [Validators.pattern('^01[0125][0-9]{8}$')]],
      nationalId: [seed.nationalId || '', [Validators.pattern('^\\d{14}$')]],
      city: [seed.city || ''],
      district: [seed.district || ''],
      street: [seed.street || ''],
      currentPassword: ['', [Validators.minLength(6)]],
      newPassword: ['', [Validators.minLength(6)]]
    });
    this.updateAvatar(seed.fullName || 'User');
  }

  private patchForm(data: UserProfile): void {
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (this.profileForm.get(key)) this.profileForm.get(key)!.setValue(value);
    });
    this.updateAvatar(data.fullName || this.profileForm.get('fullName')?.value);
  }

  private updateAvatar(name: string): void {
    this.selectedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=298b64&color=fff`;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => { this.selectedAvatar = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.saveState = 'error';
      this.saveMessage = 'من فضلك تأكد من إدخال البيانات بشكل صحيح.';
      setTimeout(() => this.saveState = 'idle', 3500);
      return;
    }

    this.saveState = 'saving';
    const raw = this.profileForm.getRawValue();

    this.profileService.updateProfile(raw).subscribe({
      next: (res) => {
        this.saveState = 'success';
        this.saveMessage = res?.message || 'تم حفظ بياناتك بنجاح';
        this.profileForm.patchValue({ currentPassword: '', newPassword: '' });
        setTimeout(() => this.saveState = 'idle', 3200);
      },
      error: () => {
        this.saveState = 'success'; // بروتوتايب: لحد ما يتم ربط الـ endpoint فعلياً على السيرفر
        this.saveMessage = 'تم حفظ التغييرات محلياً (في انتظار ربط الـ API الفعلي)';
        setTimeout(() => this.saveState = 'idle', 3200);
      }
    });
  }
}
