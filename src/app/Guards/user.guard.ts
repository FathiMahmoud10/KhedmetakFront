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

  // لو أدمن، مش المفروض يدخل على صفحات اليوزر إلا في وضع "معاينة كمستخدم"
  // اللي بيفعّله بنفسه من صفحة ملف الأدمن (من غير ما نلمس صلاحيات المستخدم العادي)
  if (role === 'Admin' && !authService.isUserPreview()) {
    router.navigate(['/admin-dashboard']);
    return false;
  }

  return true;
};
