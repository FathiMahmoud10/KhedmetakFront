import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterCom } from "./Components/SharedComponents/footer-com/footer-com";
import { NavbarCom } from "./Components/SharedComponents/navbar-com/navbar-com";
import { HomePage } from './Pages/home-page/home-page';
import { SignupComponent } from './Pages/signup-page/signup-page';
import { LoginComponent } from './Pages/login-page/login-page';

@Component({
  selector: 'app-root',
  imports: [ LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('KhedmetakFront');
}
