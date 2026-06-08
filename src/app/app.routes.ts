import { Routes } from '@angular/router';
import { HomePage } from './Pages/home-page/home-page';
import { LoginComponent } from './Pages/login-page/login.component';
import { ChatPageComponent } from './Pages/chat-page/chat-page.component';
import { SignupComponent } from './Pages/signup-page/signup.component';

export const routes: Routes = [
    // redirectTo + 'patname'
    // when use redirectTo --> should use pathMatch with it
    {path:'',redirectTo:'home',pathMatch:"full"},
    {path:'home',component:HomePage},
    {path:'chat',component:ChatPageComponent},
    // {path:'services'},
    {path:'login',component:LoginComponent},
    {path:'SignUp',component:SignupComponent },
    // {path:'signup'},


    ////////// ---------this path must be at the end of paths----------
    // {path:'**',component:NotFound} //---- for any incorrect path
];
