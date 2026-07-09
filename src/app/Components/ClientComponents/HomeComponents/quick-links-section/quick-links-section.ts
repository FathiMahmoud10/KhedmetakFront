import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quick-links-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quick-links-section.html',
  styleUrl: './quick-links-section.scss'
})
export class QuickLinksSection {}
