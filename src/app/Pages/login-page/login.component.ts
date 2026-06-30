import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../APIServices/SharedServices/auth.service';
import { DigitalPortalService } from '../../APIServices/SharedServices/digital-portal.service';
import { ThemeService } from '../../Services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  // ── Tab الحالي: 'email' | 'portal' ───────────────────────────────
  activeTab: 'email' | 'portal' = 'email';

  // ── تسجيل الدخول بالبريد الإلكتروني ─────────────────────────────
  email       = '';
  password    = '';
  rememberMe  = false;
  showPass    = false;
  isLoading   = false;
  serverError : string | null = null;
  emailError  = false;
  passwordError = false;

  // ── تسجيل الدخول ببوابة مصر الرقمية ─────────────────────────────
  portalNationalId = '';
  portalPhone      = '';
  portalOtp        = '';
  portalStep: 'credentials' | 'otp' = 'credentials'; // الخطوة الحالية
  portalLoading    = false;
  portalError : string | null = null;
  portalSuccess: string | null = null;

  year = new Date().getFullYear();
  isDarkMode = false;
  private themeSub?: Subscription;

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private portalService: DigitalPortalService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.themeService.isDarkMode;
    this.themeSub = this.themeService.isDarkMode$.subscribe(dark => {
      this.isDarkMode = dark;
    });
  }

  ngOnDestroy(): void { this.themeSub?.unsubscribe(); }

  toggleDarkMode(): void { this.themeService.toggleTheme(); }
  switchTab(tab: 'email' | 'portal'): void {
    this.activeTab   = tab;
    this.serverError = null;
    this.portalError = null;
    this.portalSuccess = null;
    this.portalStep = 'credentials';
  }

  // ── Email / Password Login ────────────────────────────────────────
  validateEmail()    { this.emailError    = !this.email.trim(); }
  validatePassword() { this.passwordError = this.password.length < 6; }

  signInWithGoogle() { console.log('Google sign in'); }

  onSubmit() {
    this.validateEmail();
    this.validatePassword();
    if (this.emailError || this.passwordError) return;

    this.isLoading   = true;
    this.serverError = null;

    this.http.post<any>(`${environment.apiUrl}/Auth/login`, {
      email: this.email, password: this.password
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.data?.token) {
          const expireDate = new Date(res.data.expiresAt);
          document.cookie =
            `token=${res.data.token}; expires=${expireDate.toUTCString()}; path=/`;
        }
        this.redirectByRole();
      },
      error: (err) => {
        this.isLoading = false;
        this.serverError = err.status === 401
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
          : 'حدث خطأ، يرجى المحاولة مرة أخرى';
      }
    });
  }

  // ── Portal OTP Login — Step 1: إرسال OTP ─────────────────────────
  sendPortalOtp(): void {
    if (!this.portalNationalId.trim() || !this.portalPhone.trim()) {
      this.portalError = 'الرقم القومي ورقم الهاتف مطلوبان';
      return;
    }

    this.portalLoading = true;
    this.portalError   = null;

    this.portalService.sendOtp(this.portalNationalId, this.portalPhone).subscribe({
      next: (res) => {
        this.portalLoading = false;
        if (res?.success) {
          this.portalStep    = 'otp';
          this.portalSuccess = 'تم إرسال كود التحقق (123456) إلى هاتفك';
        } else {
          this.portalError = res?.message ?? 'فشل إرسال الكود';
        }
      },
      error: (err) => {
        this.portalLoading = false;
        this.portalError   =
          err?.error?.message ?? 'البيانات غير صحيحة أو غير مسجلة في البوابة الرقمية';
      }
    });
  }

  // ── Portal OTP Login — Step 2: التحقق وتسجيل الدخول ─────────────
  verifyPortalOtp(): void {
    if (!this.portalOtp.trim()) {
      this.portalError = 'أدخل كود التحقق';
      return;
    }

    this.portalLoading = true;
    this.portalError   = null;
    this.portalSuccess = null;

    this.portalService
      .verifyOtpAndLogin(this.portalNationalId, this.portalPhone, this.portalOtp)
      .subscribe({
        next: (res) => {
          this.portalLoading = false;
          if (res?.data?.token) {
            const expireDate = new Date(res.data.expiresAt);
            document.cookie =
              `token=${res.data.token}; expires=${expireDate.toUTCString()}; path=/`;
            this.redirectByRole();
          } else {
            this.portalError = res?.message ?? 'فشل تسجيل الدخول';
          }
        },
        error: (err) => {
          this.portalLoading = false;
          this.portalError   =
            err?.error?.message ?? 'كود التحقق غير صحيح، حاول مجدداً';
        }
      });
  }

  // العودة لخطوة إدخال البيانات
  backToCredentials(): void {
    this.portalStep    = 'credentials';
    this.portalOtp     = '';
    this.portalError   = null;
    this.portalSuccess = null;
  }

  // ── توجيه حسب الـ Role ────────────────────────────────────────────
  private redirectByRole(): void {
    const role = this.authService.getRole();
    if (role === 'Admin')      this.router.navigate(['/admin-dashboard']);
    else if (role === 'User')  this.router.navigate(['/user-dashboard']);
    else                       this.router.navigate(['/home']);
  }
}
