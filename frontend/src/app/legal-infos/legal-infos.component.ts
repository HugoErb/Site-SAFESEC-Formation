import { Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CommonService } from '../common.service';

// Font Awesome Icons
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faCircleArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-legal-infos',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './legal-infos.component.html'
})
export class LegalInfosComponent {
  constructor(private router: Router) {
  }
  icons = {faBars, faCircleArrowLeft};
  burgerMenuOpened: boolean = false;

  /**
  * Gère les clics à l'extérieur du menu burger pour fermer le menu.
  * 
  * Cette méthode est déclenchée par un écouteur d'événements qui surveille tous les clics dans le document.
  * Si le menu burger est ouvert et que le clic n'est pas dans le menu burger,
  * alors le menu sera fermé. Ceci est vérifié en utilisant la méthode `contains` sur l'élément natif du menu burger.
  * 
  * @param event L'objet MouseEvent associé au clic du document.
  */
  @ViewChild('menuContainerRef') menuContainerRef!: ElementRef;
  @ViewChild('menuBurger') menuBurger!: ElementRef;
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.burgerMenuOpened && !this.menuBurger.nativeElement.contains(event.target)) {
      this.burgerMenuOpened = false;
    }
  }

  /**
  * Navigue vers la route d'accueil et inclut une section de redirection dans les paramètres de la route.
  * 
  * @param {string} section - La section de la route d'accueil vers laquelle naviguer. Cette valeur sera incluse en tant que paramètre dans la navigation.
  */
  navigateToHome(section: string) {
    this.router.navigate(['home', { redirectionSection: section }]);
  }

  /**
  * Sert à ouvrir ou fermer le menu burger en inversant l'état actuel du menu. 
  * Elle arrête également la propagation de l'événement de clic pour éviter des interactions indésirables avec d'autres éléments de l'interface utilisateur.
  * 
  * @param {MouseEvent} event - L'événement de clic qui a déclenché l'appel de la méthode. Utilisé pour arrêter la propagation de l'événement.
  */
  toggleBurgerMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.burgerMenuOpened = !this.burgerMenuOpened;
  }
}
