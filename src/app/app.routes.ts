import { Routes } from '@angular/router';
import { HomePage } from './Pages/home-page/home-page';
import { ChatPageComponent } from './Pages/chat-page/chat-page.component';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'chat', component: ChatPageComponent }
];