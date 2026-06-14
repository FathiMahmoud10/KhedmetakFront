import { Routes } from '@angular/router';
import { HomePage } from './Pages/home-page/home-page';
import { LoginComponent } from './Pages/login-page/login.component';
import { ChatPageComponent } from './Pages/chat-page/chat-page.component';
import { SignupComponent } from './Pages/signup-page/signup.component';
import { AdminProfileComponent} from './Pages/admin-profile/admin-profile';
import { AdminDashboard  } from './Pages/admin-dashboard/admin-dashboard';
import { ManageServices} from './Pages/manage-services/manage-services';



export const routes: Routes = [
    // redirectTo + 'patname'
    // when use redirectTo --> should use pathMatch with it
    {path:'',redirectTo:'home',pathMatch:"full"},
    {path:'home',component:HomePage},
    {path:'chat',component:ChatPageComponent},

    { path: 'admin-profile', component: AdminProfileComponent },
    { path: 'admin-dashboard', component: AdminDashboard  },
    { path: 'manage-services', component: ManageServices  } ,
    // {path:'services'},
    {path:'login',component:LoginComponent},
    {path:'SignUp',component:SignupComponent },
      {
    path: 'services',
    loadChildren: () =>
      import('./services.routes').then(m => m.SERVICES_ROUTES),
  },
    // {path:'signup'},


    ////////// ---------this path must be at the end of paths----------
    // {path:'**',component:NotFound} //---- for any incorrect path
    { path: 'admin-profile', component: AdminProfileComponent }
];
