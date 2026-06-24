import { Routes } from '@angular/router';
import { HomePage } from './Pages/home-page/home-page';
import { LoginComponent } from './Pages/login-page/login.component';
import { ChatPageComponent } from './Pages/chat-page/chat-page.component';
import { SignupComponent } from './Pages/signup-page/signup.component';
import { AdminProfileComponent} from './Pages/admin-profile/admin-profile';
import { AdminDashboard  } from './Pages/admin-dashboard/admin-dashboard';
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




export const routes: Routes = [
    // redirectTo + 'patname'
    // when use redirectTo --> should use pathMatch with it
    { path: '', redirectTo: 'home', pathMatch: "full" },
    { path: 'home', component: HomePage },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'chat', component: ChatPageComponent },
    { path: 'services', component: AllServicesComponent },

    // { path: 'services', loadChildren: () => import('./services.routes').then(m => m.SERVICES_ROUTES) },
    { path: 'user-dashboard', component: UserDashboard },
    { path: 'admin-profile', component: AdminProfileComponent },
    { path: 'my-requests', component: MyRequests },
    { path: 'my-files', component: MyFiles },

    
    { path: 'admin-dashboard', component: AdminDashboard },
    { path: 'admin-profile', component: AdminProfileComponent },
    { path: 'manage-services', component: ManageServices },
    { path: 'manage-services/delete/:id', component: ManageServices },
    { path: 'admin-categories', component: ManageCategories },
    { path: 'admin-steps', component: ServiceSteps },
    { path: 'admin-service-detail/:id', component: ServiceDetailComponent },
    { path: 'token-check', component: TokenCheckComponent },
    { path: 'services/:id', component: ServiceDetailsComponent }
    // { path: '**', component: NotFound } // for any incorrect path
];
