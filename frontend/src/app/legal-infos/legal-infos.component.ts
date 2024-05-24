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
  * Navigue vers un composant spécifié et, optionnellement, fait défiler vers une section au sein de ce composant.
  *
  * @param {string} composant - Le nom du composant vers lequel naviguer. Cela doit être le chemin ou
  *                             la route associée au composant cible dans la configuration de routage Angular.
  * @param {string} section - La section au sein du composant cible vers laquelle l'utilisateur doit être redirigé.
  *                           Ce paramètre est optionnel et est utilisé pour indiquer une section ou
  *                           un fragment spécifique au sein du composant.
  */
  navigateTo(component: string, section: string) {
    this.router.navigate([component, { redirectionSection: section }]);
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
