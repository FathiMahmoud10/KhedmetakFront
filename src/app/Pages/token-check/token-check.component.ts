import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../APIServices/SharedServices/auth.service';

@Component({
  selector: 'app-token-check',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './token-check.component.html',
  styleUrls: ['./token-check.component.scss']
})
export class TokenCheckComponent implements OnInit {
  token: string | null = null;
  payload: any = null;
  errorMessage = '';
  isValid = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.token = this.authService.getTokenFromCookie();

    if (!this.token) {
      this.router.navigate(['/login']);
      return;
    }

    this.payload = this.authService.decodeJwt(this.token);

    if (!this.payload) {
      this.errorMessage = 'التوكن غير صالح أو منتهي الصلاحية.';
      setTimeout(() => this.router.navigate(['/login']), 1600);
      return;
    }

    this.isValid = true;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
