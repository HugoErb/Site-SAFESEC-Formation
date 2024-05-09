import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MailService } from '../mail.service';
import Swal from 'sweetalert2';
import axios from 'axios';

// Font Awesome Icons
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { faPersonWalkingArrowRight } from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';

// Définition de l'interface pour la réponse de l'API de MailCheck.ai
interface EmailValidityResponse {
  disposable: boolean;
  mx: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private mailService: MailService, private http: HttpClient) { }
  icons = { faLinkedin, faEnvelope, faWheelchair, faCalendarCheck, faGraduationCap, faUsers, faBookOpen, faPersonWalkingArrowRight };
  burgerMenuOpened: boolean = false;

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

    // On récupère le nom de la formation de la page home
    if (this.activatedRoute.snapshot.params.hasOwnProperty('redirectionSection')) {
      this.scrollToSection(this.activatedRoute.snapshot.params['redirectionSection']);
    }
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
  * Sert à ouvrir ou fermer le menu burger en inversant l'état actuel du menu chaque fois qu'elle est appelée. 
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
  chooseTrainingPlan(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const trainingName = target.closest('.rounded-lg')?.querySelector('h3')?.textContent?.trim();
    if (trainingName) {
      this.router.navigate(['/training-form', { chosenTrainingName: trainingName }]).then(() => {
        window.scrollTo(0, 0);
      });;
    } else {
      console.error('Impossible de trouver le nom de la formation.');
    }
  }

  /**
  * Filtre et formate la saisie d'un numéro de téléphone dans un champ de saisie HTML.
  * Seules les valeurs numériques sont conservées, et un espace est ajouté tous les deux chiffres.
  * Limite la saisie à un maximum de 10 chiffres.
  * 
  * @param event L'événement d'entrée déclenché lors de la saisie dans le champ de saisie.
  *              L'événement doit être de type `Event`.
  */
  formatAndRestrictPhoneInput(event: Event): void {
    let input = event.target as HTMLInputElement;
    let value = input.value;
    let formattedValue = '';

    // Supprimer tout caractère non numérique et appliquer le formatage
    let numbers = value.replace(/\D/g, '');

    // Limiter à 10 chiffres
    numbers = numbers.slice(0, 10);

    // Ajouter des espaces tous les deux chiffres
    for (let i = 0; i < numbers.length; i++) {
      if (i !== 0 && i % 2 === 0) {
        formattedValue += ' ';
      }
      formattedValue += numbers[i];
    }

    // Mettre à jour la valeur du modèle et de l'input
    this.phoneNumberMail = formattedValue;
    input.value = formattedValue;
  }

  /**
  * Prépare et envoie un email à l'aide d'un service de messagerie. 
  * Avant l'envoi, on vérifie les entrées pour s'assurer qu'elles sont valides en utilisant la méthode `validateInputs`. 
  * Si les validations échouent, l'envoi est interrompu. Si les validations réussissent, les données sont envoyées au service de messagerie. 
  * Les réactions aux réponses du service de messagerie, qu'elles soient réussies ou en erreur, sont gérées via des alertes à l'utilisateur.
  */
  async sendMail() {

    this.getDataIntoDictionary();

    // On vérifie les données
    const areInputsValid = await this.validateInputs();
    if (!areInputsValid) {
      return;
    }

    const mailData = { name: this.nameMail, email: this.emailMail, phoneNumber: this.phoneNumberMail, message: this.messageMail };
    this.mailService.sendMail(mailData).subscribe({
      next: (response) => {
        Swal.fire({
          position: 'top-end',
          toast: true,
          icon: 'success',
          html: '<span class="font-medium text-xl">Message envoyé !</span>',
          showConfirmButton: false,
          width: 'auto',
          timer: 3500
        });

        // Appel de la méthode pour réinitialiser les champs
        this.resetInputFields();
      }
      ,
      error: (error) => Swal.fire({
        position: 'top-end',
        toast: true,
        icon: 'error',
        html: '<span class="font-medium text-xl">Erreur lors de l\'envoi du message.</span>',
        showConfirmButton: false,
        width: 'auto',
        timer: 3500
      })
    });
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
  * Vérifie que les champs remplis par l'utilisateur pour l'envoi dans le mail sont dans un format correct.
  * 
  * @returns {Promise<boolean>} Retourne une promesse avec `true` si toutes les validations sont passées, sinon `false`.
  */
  async validateInputs(): Promise<boolean> {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const phoneNumberRegex = /^(0[1-9]) (\d{2}) (\d{2}) (\d{2}) (\d{2})$/;

    for (const [label, value] of this.inputLabelMap.entries()) {
      const trimmedValue = value.trim();

      // Vérification des champs obligatoires
      if (!trimmedValue) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur de saisie',
          text: `Le champ "${label}" est obligatoire.`,
          confirmButtonColor: "#3B82F6"
        })
        return false;
      }

      // Vérification pour l'email
      if (label.toLowerCase().includes('email')) {
        if (!emailRegex.test(trimmedValue)) {
          Swal.fire({
            icon: 'error',
            title: 'Erreur de saisie',
            text: 'Le format de l\'adresse email est invalide.',
            confirmButtonColor: "#3B82F6"
          })
          return false;
        } else {
          const isEmailValid = await this.checkEmailValidity(trimmedValue);
          if (!isEmailValid) {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Le domaine de l\'adresse email n\'est pas accepté.',
              confirmButtonColor: "#3B82F6"
            })
            return false;
          }
        }
      }

      // Vérification pour le numéro de téléphone
      if (label.toLowerCase().includes('téléphone') && !phoneNumberRegex.test(trimmedValue)) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur de saisie',
          text: 'Le format du numéro de téléphone est invalide.',
          confirmButtonColor: "#3B82F6"
        })
        return false;
      }
    }

    return true;
  }

  /**
  * Vérifie la validité d'une adresse email en utilisant l'API Mailcheck AI.
  * Pour cela la méthode évalue si l'email n'est pas jetable et si un enregistrement MX valide est présent.
  * 
  * @param {string} email L'adresse email à vérifier.
  * @returns {Promise<boolean>} La promesse renvoie `true` si l'email n'est pas jetable et a un enregistrement MX valide,
  *                             sinon `false`. Renvoie également `false` en cas d'erreur lors de la requête à l'API.
  */
  async checkEmailValidity(email: string): Promise<boolean> {
    const url = `https://api.mailcheck.ai/email/${email}`;
    try {
      const response = await axios.get<EmailValidityResponse>(url);
      // Retourne false si l'email est jetable ou si mx est false
      if (response.data.disposable || !response.data.mx) {
        return false;
      }
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Impossible de vérifier l'email : ${error.message}`);
      } else {
        console.error('Erreur inattendue lors de la vérification de l\email.');
      }
      return false;
    }
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
