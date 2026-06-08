import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {

  fullName = '';
  nationalId = '';
  phone = '';
  email = '';
  password = '';
  confirmPassword = '';
  agreed = false;

  showPass = false;
  showConfirm = false;
  isLoading = false;

  nameError = false;
  nationalIdError = false;
  phoneError = false;
  emailError = false;
  passwordError = false;
  confirmError = false;

  constructor(private router: Router) {}

  validateName() { this.nameError = !this.fullName.trim(); }
  validateNationalId() { this.nationalIdError = !/^\d{14}$/.test(this.nationalId); }
  validatePhone() { this.phoneError = !/^(\+20|0)1[0-25]\d{8}$/.test(this.phone.replace(/\s/g, '')); }
  validateEmail() { this.emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email); }
  validatePassword() { this.passwordError = this.password.length < 6; }
  validateConfirm() { this.confirmError = this.password !== this.confirmPassword; }

  signUpWithGoogle() {
    // TODO: Google OAuth
    console.log('Google sign up');
  }

  onSubmit() {
    this.validateName();
    this.validateNationalId();
    this.validatePhone();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirm();

    if (this.nameError || this.nationalIdError || this.phoneError ||
        this.emailError || this.passwordError || this.confirmError || !this.agreed) {
      return;
    }

    this.isLoading = true;

    // TODO: استبدلي بـ API call حقيقي
    // this.authService.register({...}).subscribe({
    //   next: () => this.router.navigate(['/login']),
    //   error: () => { this.isLoading = false; }
    // });

    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/login']);
    }, 1500);
  }
}
