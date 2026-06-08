import { Component } from '@angular/core';
import { HeroSectionCom } from "../../Components/ClientComponents/HomeComponents/hero-section-com/hero-section-com";
import { ServicesCardsCom } from "../../Components/ClientComponents/HomeComponents/services-cards-com/services-cards-com";
import { HowWorkSection } from '../../Components/ClientComponents/HomeComponents/how-work-section/how-work-section';

@Component({
  selector: 'app-home-page',
  imports: [HeroSectionCom, ServicesCardsCom,HowWorkSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {

}
