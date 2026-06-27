import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../APIServices/SharedServices/auth.service';

export const userGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getRole();

  // لو أدمن مش المفروض يدخل على صفحات اليوزر
  if (role === 'Admin') {
    router.navigate(['/admin-dashboard']);
    return false;
  }

  return true;
};
