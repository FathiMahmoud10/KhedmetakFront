import { HttpInterceptorFn } from '@angular/common/http';

// ============================================================
// الإنتركبتور ده بيتنفذ قبل أي Request يطلع من التطبيق.
// مهمته الوحيدة هنا: يقول للمتصفح "ابعت الكوكي (التوكن) مع
// الـ Request" حتى لو الـ API على دومين مختلف (cross-origin).
// ============================================================
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const reqWithCreds = req.clone({
    withCredentials: true
  });

  return next(reqWithCreds);
};
