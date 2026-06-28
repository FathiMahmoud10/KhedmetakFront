import { Routes } from '@angular/router';
import { HomePage } from './Pages/home-page/home-page';
import { LoginComponent } from './Pages/login-page/login.component';
import { ChatPageComponent } from './Pages/chat-page/chat-page.component';
import { SignupComponent } from './Pages/signup-page/signup.component';
import { AdminProfileComponent} from './Pages/admin-profile/admin-profile';
import { AdminDashboard } from './Pages/admin-dashboard/admin-dashboard';
import { ManageServices} from './Pages/manage-services/manage-services';
import { ManageCategories } from './Pages/manage-category/manage-categories';
import { ServiceSteps } from './Pages/service-steps/service-steps';
import { TokenCheckComponent } from './Pages/token-check/token-check.component';
import { AllServicesComponent } from './Pages/ServicesPage/all-services/all-services.component';
import { ServiceDetailsComponent } from './Pages/ServicesPage/service-details/service-details.component';
import { ServiceDetailComponent } from './Pages/service-detail/service-detail.component';
import { UserDashboard } from './Pages/user-dashboard/user-dashboard';
import { MyRequests } from './Pages/my-requests/my-requests';
import { MyFiles } from './Pages/my-files/my-files';
import { AdminFeesComponent } from './Pages/admin-fees/admin-fees';
import { AdminRequiredDocumentsComponent } from './Pages/admin-required-documents/admin-required-documents';

import { guestGuard } from './Guards/guest.guard';
import { adminGuard } from './Guards/admin.guard';
import { userGuard } from './Guards/user.guard';
import { authGuard } from './Guards/auth.guard';

export const routes: Routes = [
  // التطبيق يبدأ بصفحة الـ Home
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ==============================
  // صفحات الزوار (بدون تسجيل دخول)
  // guestGuard: لو مسجل دخول مش هيقدر يفتحهم
  // ==============================
  { path: 'login',  component: LoginComponent,  canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },

  // ==============================
  // صفحات الأدمن فقط
  // ==============================
  { path: 'admin-dashboard',       component: AdminDashboard,        canActivate: [adminGuard] },
  { path: 'admin-profile',         component: AdminProfileComponent,  canActivate: [adminGuard] },
  { path: 'manage-services',       component: ManageServices,         canActivate: [adminGuard] },
  { path: 'manage-services/delete/:id', component: ManageServices,   canActivate: [adminGuard] },
  { path: 'admin-categories',      component: ManageCategories,       canActivate: [adminGuard] },
  { path: 'admin-steps',           component: ServiceSteps,           canActivate: [adminGuard] },
  { path: 'admin-service-detail/:id', component: ServiceDetailComponent, canActivate: [adminGuard] },
  { path: 'admin-fees',            component: AdminFeesComponent,     canActivate: [adminGuard] },
  { path: 'admin-required-documents', component: AdminRequiredDocumentsComponent, canActivate: [adminGuard] },

  // ==============================
  // صفحات المستخدم العادي فقط
  // ==============================
  { path: 'user-dashboard', component: UserDashboard, canActivate: [userGuard] },
  { path: 'my-requests',    component: MyRequests,    canActivate: [userGuard] },
  { path: 'my-files',       component: MyFiles,       canActivate: [userGuard] },
  // صفحة الشات للمستخدمين والزوار
  { path: 'chat', component: ChatPageComponent },

  // ==============================
  // صفحات مشتركة وعامة (متاحة للجميع)
  // ==============================
  { path: 'home',          component: HomePage },
  { path: 'services',      component: AllServicesComponent },
  { path: 'services/:id',  component: ServiceDetailsComponent },
  { path: 'token-check',   component: TokenCheckComponent },
];
