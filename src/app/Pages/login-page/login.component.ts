import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../APIServices/SharedServices/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email = '';
  password = '';
  rememberMe = false;
  showPass = false;
  isLoading = false;
  serverError: string | null = null;

  emailError = false;
  passwordError = false;

  year = new Date().getFullYear();

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  validateEmail() { this.emailError = !this.email.trim(); }
  validatePassword() { this.passwordError = this.password.length < 6; }

  signInWithGoogle() {
    console.log('Google sign in');
  }

  onSubmit() {
    this.validateEmail();
    this.validatePassword();

    if (this.emailError || this.passwordError) return;

    this.isLoading = true;
    this.serverError = null;

    this.http.post<any>(
      `${environment.apiUrl}/Auth/login`,
      {
        email: this.email,
        password: this.password
      }
    ).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res?.data?.token) {
          const expireDate = new Date(res.data.expiresAt);
          document.cookie =
            `token=${res.data.token}; expires=${expireDate.toUTCString()}; path=/`;
        }

        // توجيه حسب الـ Role
        const role = this.authService.getRole();
        if (role === 'Admin') {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/home']);
        }
      },

      error: (err) => {
        this.isLoading = false;

        if (err.status === 401) {
          this.serverError = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        } else {
          this.serverError = 'حدث خطأ، يرجى المحاولة مرة أخرى';
        }
      }
    });
  }
}
