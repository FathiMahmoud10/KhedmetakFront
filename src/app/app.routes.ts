import { Routes } from '@angular/router';
import { HomePage } from './Pages/home-page/home-page';

export const routes: Routes = [
    // redirectTo + 'patname' 
    // when use redirectTo --> should use pathMatch with it
    {path:'',redirectTo:'home',pathMatch:"full"},
    {path:'home',component:HomePage},
    // {path:'chat'}
    // {path:'services'},
    // {path:'login'},
    // {path:'signup'},


    ////////// ---------this path must be at the end of paths----------
    // {path:'**',component:NotFound} //---- for any incorrect path
];
