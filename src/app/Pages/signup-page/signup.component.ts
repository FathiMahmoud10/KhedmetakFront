import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../APIServices/SharedServices/auth.service';

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

  dateOfBirth = '';
  city = '';
  district = '';
  street = '';
  buildingNumber = '';
  floorNumber = '';
  apartmentNumber = '';
  postalCode = '';

  showPass = false;
  showConfirm = false;
  isLoading = false;
  serverError: string | null = null;

  nameError = false;
  nationalIdError = false;
  phoneError = false;
  emailError = false;
  passwordError = false;
  confirmError = false;
  dateOfBirthError = false;
  cityError = false;
  districtError = false;
  streetError = false;
  buildingNumberError = false;

  constructor(private router: Router, private authService: AuthService) {}

  validateName() { this.nameError = !this.fullName.trim(); }
  validateNationalId() { this.nationalIdError = !/^\d{14}$/.test(this.nationalId); }
  validatePhone() { this.phoneError = !/^(\+20|0)1[0-25]\d{8}$/.test(this.phone.replace(/\s/g, '')); }
  validateEmail() { this.emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email); }
  validatePassword() { this.passwordError = this.password.length < 6; }
  validateConfirm() { this.confirmError = this.password !== this.confirmPassword; }
  validateDateOfBirth() { this.dateOfBirthError = !this.dateOfBirth; }
  validateCity() { this.cityError = !this.city.trim(); }
  validateDistrict() { this.districtError = !this.district.trim(); }
  validateStreet() { this.streetError = !this.street.trim(); }
  validateBuildingNumber() { this.buildingNumberError = !this.buildingNumber.trim(); }

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
    this.validateDateOfBirth();
    this.validateCity();
    this.validateDistrict();
    this.validateStreet();
    this.validateBuildingNumber();

    if (this.nameError || this.nationalIdError || this.phoneError ||
        this.emailError || this.passwordError || this.confirmError ||
        this.dateOfBirthError || this.cityError || this.districtError ||
        this.streetError || this.buildingNumberError || !this.agreed) {
      return;
    }

    this.isLoading = true;
    this.serverError = null;

    this.authService.register({
      name: this.fullName,
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      nationalId: this.nationalId,
      phone: this.phone,
      dateOfBirth: this.dateOfBirth,
      city: this.city,
      district: this.district,
      street: this.street,
      buildingNumber: this.buildingNumber,
      floorNumber: this.floorNumber,
      apartmentNumber: this.apartmentNumber,
      postalCode: this.postalCode
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;

        if (err.status === 400) {
          this.serverError = err?.error?.message || 'البريد الإلكتروني مسجل بالفعل أو البيانات غير صحيحة';
        } else {
          this.serverError = 'حدث خطأ، يرجى المحاولة مرة أخرى';
        }
      }
    });
  }
}
