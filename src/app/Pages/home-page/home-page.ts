import { Component } from '@angular/core';
import { HeroSectionCom } from "../../Components/ClientComponents/HomeComponents/hero-section-com/hero-section-com";
import { ServicesCardsCom } from "../../Components/ClientComponents/HomeComponents/services-cards-com/services-cards-com";
import { HowWorkSection } from '../../Components/ClientComponents/HomeComponents/how-work-section/how-work-section';
import { DigitalEgyptSection } from '../../Components/ClientComponents/HomeComponents/digital-egypt-section/digital-egypt-section';
import { EmergencySection } from '../../Components/ClientComponents/HomeComponents/emergency-section/emergency-section';
import { QuickLinksSection } from '../../Components/ClientComponents/HomeComponents/quick-links-section/quick-links-section';

@Component({
  selector: 'app-home-page',
  imports: [HeroSectionCom, ServicesCardsCom, HowWorkSection, DigitalEgyptSection, EmergencySection, QuickLinksSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {

}
