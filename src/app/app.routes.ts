import { Routes } from '@angular/router';
import { HomePage } from './Pages/home-page/home-page';
import { LoginComponent } from './Pages/login-page/login.component';
import { ChatPageComponent } from './Pages/chat-page/chat-page.component';
import { SignupComponent } from './Pages/signup-page/signup.component';
import { AdminProfileComponent} from './Pages/admin-profile/admin-profile';
import { AdminDashboard  } from './Pages/admin-dashboard/admin-dashboard';
import { ManageServices} from './Pages/manage-services/manage-services';
import { ManageCategories } from './Pages/manage-category/manage-categories';
import { TokenCheckComponent } from './Pages/token-check/token-check.component';
import { AllServicesComponent } from './Pages/ServicesPage/all-services/all-services.component';
import { ServiceDetailsComponent } from './Pages/ServicesPage/service-details/service-details.component';



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
   
    { path: 'admin-dashboard', component: AdminDashboard },
    { path: 'admin-profile', component: AdminProfileComponent },
    { path: 'manage-services', component: ManageServices },
    { path: 'admin-categories', component: ManageCategories },
    { path: 'token-check', component: TokenCheckComponent },
    { path: 'services/:id', component: ServiceDetailsComponent }
    // { path: '**', component: NotFound } // for any incorrect path
];
