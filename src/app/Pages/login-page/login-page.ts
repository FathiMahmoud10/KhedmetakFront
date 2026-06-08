import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss']
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

  constructor(private router: Router) {}

  validateEmail() { this.emailError = !this.email.trim(); }
  validatePassword() { this.passwordError = this.password.length < 6; }

  signInWithGoogle() {
    // TODO: Google OAuth
    console.log('Google sign in');
  }

  onSubmit() {
    this.validateEmail();
    this.validatePassword();
    this.serverError = null;

    if (this.emailError || this.passwordError) return;

    this.isLoading = true;

    // TODO: استبدلي بـ API call حقيقي
    // this.authService.login(this.email, this.password).subscribe({
    //   next: () => this.router.navigate(['/home']),
    //   error: () => { this.isLoading = false; this.serverError = 'Invalid credentials.'; }
    // });

    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/home']);
    }, 1500);
  }
}
