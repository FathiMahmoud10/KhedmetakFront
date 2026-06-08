import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterCom } from "./Components/SharedComponents/footer-com/footer-com";
import { NavbarCom } from "./Components/SharedComponents/navbar-com/navbar-com";
import { HomePage } from './Pages/home-page/home-page';


@Component({
  selector: 'app-root',
  imports: [RouterModule, FooterCom, NavbarCom,HomePage],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  // protected readonly title = signal('KhedmetakFront');
}
