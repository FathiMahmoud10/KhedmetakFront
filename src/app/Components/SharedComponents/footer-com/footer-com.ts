import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer-com',
  imports: [RouterLink],
  templateUrl: './footer-com.html',
  styleUrl: './footer-com.scss',
})
export class FooterCom {
  year = new Date().getFullYear();
}
