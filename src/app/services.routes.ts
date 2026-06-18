import { Routes } from '@angular/router';


export const SERVICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Pages/ServicesPage/all-services/all-services.component').then(m => m.AllServicesComponent),
    title: 'جميع الخدمات | خدمتك AI',
  },
//   {
//     path: 'traffic',
//     loadComponent: () =>
//       import('./Pages/ServicesPage/traffic-services/traffic-services.component').then(m => m.TrafficServicesComponent),
//     title: 'خدمات المرور | خدمتك AI',
//   },
//   {
//     path: 'civil-status',
//     loadComponent: () =>
//       import('./Pages/ServicesPage/civil-status-services/civil-status-services.component').then(m => m.CivilStatusServicesComponent),
//     title: 'خدمات الأحوال المدنية | خدمتك AI',
//   },

//   {
//     path: 'education',
//     loadComponent: () =>
//       import('./Pages/ServicesPage/education-services/education-services.component').then(m => m.EducationServicesComponent),
//     title: 'خدمات التعليم | خدمتك AI',
//   },
//   {
//     path: 'details/:id',
//     loadComponent: () =>
//       import('./Pages/ServicesPage/service-details/service-details.component').then(m => m.ServiceDetailsComponent),
//     title: 'تفاصيل الخدمة | خدمتك AI',
//   },
];
