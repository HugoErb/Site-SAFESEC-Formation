import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../common.service';
import { SeoService } from '../seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    protected commonService: CommonService,
    private readonly seo: SeoService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) { }
  burgerMenuOpened: boolean = false;
  headerScrolled: boolean = false;

  // Variables concernants la page de formulaire de demande de formation
  redirectionSection: string = "";
  chosenTrainingName: string = "";

  // Variables pour le mail
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  public inputLabelMap = new Map<string, string>();
  nameMail: string = "";
  emailMail: string = "";
  phoneNumberMail: string = "";
  messageMail: string = "";

  ngOnInit() {
    this.seo.updatePage({
      title: 'Formations sécurité, SST & gestion des agressions | SAFESEC',
      description: 'SAFESEC Formation prépare vos équipes aux risques professionnels : SST, gestion des agressions, self-défense, attentat et sécurisation de site.',
      path: '/home',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': ['EducationalOrganization', 'LocalBusiness'],
          '@id': 'https://safesec-formation.fr/#organization',
          name: 'SAFESEC Formation',
          url: 'https://safesec-formation.fr/home',
          logo: {
            '@type': 'ImageObject',
            url: 'https://safesec-formation.fr/assets/imgs/logo_safesec_og.png',
            width: 1200,
            height: 630
          },
          image: 'https://safesec-formation.fr/assets/imgs/logo_safesec_og.png',
          description: 'Formations professionnelles en prévention, sécurité, secourisme SST et gestion des situations sensibles.',
          founder: {
            '@type': 'Person',
            name: 'Christophe Eribon',
            sameAs: 'https://www.linkedin.com/in/christophe-e-7a6813167/'
          },
          address: {
            '@type': 'PostalAddress',
            postalCode: '17380',
            addressLocality: 'Annezay',
            addressCountry: 'FR'
          },
          sameAs: [
            'https://www.linkedin.com/in/christophe-e-7a6813167/',
            'https://sdcs-formation.fr/'
          ],
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Catalogue de formations SAFESEC',
            itemListElement: [
              'Gestion des incivilités et des agressions',
              'Self-défense en milieu professionnel',
              'Sauvetage Secourisme du Travail (SST)',
              'Attentat et agression collective avec arme',
              'Sécurisation de site',
              'Plan de formation personnalisé'
            ].map((name) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Course',
                name,
                provider: { '@id': 'https://safesec-formation.fr/#organization' }
              }
            }))
          }
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': 'https://safesec-formation.fr/#website',
          url: 'https://safesec-formation.fr/',
          name: 'SAFESEC Formation',
          inLanguage: 'fr-FR',
          publisher: { '@id': 'https://safesec-formation.fr/#organization' }
        }
      ]
    });

    this.updateHeaderState();

    // On récupère le nom de la formation de la page home
    if (this.activatedRoute.snapshot.params.hasOwnProperty('redirectionSection')) {
      this.scrollToSection(this.activatedRoute.snapshot.params['redirectionSection']);
    }
  }

  @HostListener('window:scroll')
  updateHeaderState(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.headerScrolled = window.scrollY > 16;
    }
  }

  /**
  * Navigue vers un composant spécifié.
  *
  * @param {string} composant - Le nom du composant vers lequel naviguer. Cela doit être le chemin ou
  *                             la route associée au composant cible dans la configuration de routage Angular.
  */
  navigateTo(component: string) {
    this.router.navigate([component]).then(() => {
      window.scrollTo(0, 0);
    });
  }

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
  * Permet la navigation vers différentes sections de la page en utilisant un défilement fluide.
  * Si le menu burger est ouvert, il est d'abord fermé avant de procéder au défilement.
  * La méthode recherche l'élément de section par son identifiant. Si l'élément est trouvé, elle calcule la position de l'élément
  * en tenant compte de la hauteur fixe de l'en-tête et déplace le défilement à cette position avec un comportement fluide.
  *
  * @param sectionId L'identifiant de l'élément HTML vers lequel défiler.
  */
  scrollToSection(sectionId: string): void {
    if (this.burgerMenuOpened) {
      this.burgerMenuOpened = !this.burgerMenuOpened;
    }

    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const headerHeight = 64;
        const position = sectionTop - headerHeight;
        window.scrollTo({ top: position, behavior: 'smooth' });
      }
    }, 50);
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

  /**
  * Extrait le nom de la formation à partir de l'élément HTML cliqué qui déclenche l'événement.
  * Le nom est recherché dans un élément `<h3>` qui doit se trouver à l'intérieur du premier parent avec la classe 'rounded-lg' du point de clic.
  * Si le nom est trouvé, la méthode redirige l'utilisateur vers le formulaire de formation associé au plan choisi.
  *
  * @param {MouseEvent} event - L'événement de clic qui a déclenché l'appel de la méthode.
  */
  chooseTraining(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const trainingName = target.closest('.rounded-lg')?.querySelector('h3')?.textContent?.trim();
    if (trainingName) {
      this.router.navigate(['/training-form'], { queryParams: { formation: trainingName } }).then(() => {
        window.scrollTo(0, 0);
      });
    } else {
      console.error('Impossible de trouver le nom de la formation.');
    }
  }

  /**
  * Prépare et envoie un email en utilisant le service commun.
  * Si l'envoi de l'email réussit, on réinitialise les champs de saisie.
  *
  * @returns {Promise<void>} Une promesse qui se résout une fois que l'email a été envoyé et que les 
  * champs de saisie ont été réinitialisés en cas de succès.
  */
  async sendMail(): Promise<void> {
    this.getDataIntoDictionary();
    if (await this.commonService.sendMail(this.inputLabelMap, false)) {
      this.resetInputFields();
    }
  }

  /**
  * Parcourt les champs de saisie dans le HTML et mappe leurs valeurs à leurs labels correspondants.
  * La méthode utilise `inputFields` pour obtenir une liste des éléments de saisie. Pour chaque champ de saisie, elle récupère
  * le label associé en utilisant son attribut 'id'. Si un label est trouvé pour une valeur de champ, la méthode les mappent dans `inputLabelMap`.
  */
  private getDataIntoDictionary() {
    this.inputFields.forEach(input => {
      const label = document.querySelector(`label[for="${input.nativeElement.id}"]`);
      if (label) {
        this.inputLabelMap.set(label.textContent!.trim(), input.nativeElement.value);
      }
    });
  }

  /**
  * Réinitialise les valeurs de tous les champs de saisie marqués avec la directive locale #inputField.
  * En l'occurence, la méthode permet de réinitialiser la valeur des champs de l'envoi de mail.
  */
  resetInputFields() {
    this.inputFields.forEach(field => {
      if (field.nativeElement instanceof HTMLInputElement || field.nativeElement instanceof HTMLTextAreaElement) {
        field.nativeElement.value = '';
      }
    });
  }

}
