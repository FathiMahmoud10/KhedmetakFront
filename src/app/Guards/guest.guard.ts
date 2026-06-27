import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../APIServices/SharedServices/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // لو مسجل دخول، يوديه للصفحة المناسبة حسب الـ role
  const role = authService.getRole();
  if (role === 'Admin') {
    router.navigate(['/admin-dashboard']);
  } else {
    router.navigate(['/user-dashboard']);
  }

  return false;
};
