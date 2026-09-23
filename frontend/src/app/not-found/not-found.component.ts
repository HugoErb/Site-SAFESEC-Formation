import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SeoService } from '../seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent {
  burgerMenuOpened = false;

  constructor(private readonly seo: SeoService) {
    this.seo.updatePage({
      title: 'Page introuvable | SAFESEC Formation',
      description: 'La page demandée est introuvable. Retrouvez les formations et les coordonnées de SAFESEC Formation.',
      path: '/404',
      robots: 'noindex, nofollow'
    });
  }

  toggleBurgerMenu(): void {
    this.burgerMenuOpened = !this.burgerMenuOpened;
  }
}
