import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterCom } from "./Components/footer-com/footer-com";
import { NavbarCom } from "./Components/navbar-com/navbar-com";
import { HomePage } from './Pages/home-page/home-page';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterCom, NavbarCom,HomePage],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('KhedmetakFront');
}
