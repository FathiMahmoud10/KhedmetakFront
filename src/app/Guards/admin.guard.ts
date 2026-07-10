import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../APIServices/SharedServices/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getRole();
  if (role === 'Admin') {
    // رجوع الأدمن لأي صفحة أدمن حقيقية ينهي وضع "معاينة كمستخدم" تلقائياً
    authService.disableUserPreview();
    return true;
  }

  // لو user عادي يروح على dashboard الخاص بيه
  router.navigate(['/user-dashboard']);
  return false;
};
