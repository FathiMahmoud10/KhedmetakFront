import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () =>
      import('./Layouts/admin-layout/admin-layout')
        .then(m => m.AdminLayout),
    // إضافة مسارات فرعية داخل الـ Admin Layout
    children: [
      {
        path: '', // هذا المسار الفارغ يعني أنه سيتم تحميل الـ dashboard تلقائياً عند فتح /admin
        loadComponent: () => 
          import('./Pages/admin/dashboard/dashboard') // تأكدي من كتابة مسار ملف الـ dashboard.ts بشكل صحيح هنا
            .then(m => m.Dashboard)
      },
      /* يمكنكِ مستقبلاً إضافة باقي الصفحات هنا مثل:
      {
        path: 'users',
        loadComponent: () => import('./users/users').then(m => m.UsersComponent)
      } 
      */
    ]
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  // مسار احتياطي في حال كتابة رابط خاطئ يوجه المستخدم للرئيسية
  {
    path: '**',
    redirectTo: 'admin'
  }
];
