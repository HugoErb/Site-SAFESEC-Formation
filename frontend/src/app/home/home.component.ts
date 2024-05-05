import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MailService } from '../mail.service';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';

// Icons
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { faPersonWalkingArrowRight } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, InputTextareaModule, InputTextModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private mailService: MailService) { }
  icons = { faLinkedin, faEnvelope, faWheelchair, faCalendarCheck, faGraduationCap, faUsers, faBookOpen, faPersonWalkingArrowRight };
  burgerMenuOpened: boolean = false;

  // Variables concernants la page de formulaire de demande de formation
  redirectionSection: string = "";
  chosenTrainingName: string = "";

  // Variables pour le mail
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
  * Avant l'envoi, elle vérifie les entrées pour s'assurer qu'elles sont valides en utilisant la méthode `validateInputs`. 
  * Si les validations échouent, l'envoi est interrompu. Si les validations réussissent, les données sont envoyées au service de messagerie. 
  * Les réactions aux réponses du service de messagerie, qu'elles soient réussies ou en erreur, sont gérées via des alertes à l'utilisateur.
  */
  sendMail() {

    // On vérifie les données
    if (!this.validateInputs()) {
      return;
    }
    var name = this.nameMail
    var email = this.emailMail
    var tel = this.phoneNumberMail
    var message = this.messageMail

    const mailData = { name, email, tel, message };
    this.mailService.sendMail(mailData).subscribe({
      next: (response) => alert('Mail envoyé avec succès !'),
      error: (error) => alert('Erreur lors de l\'envoi du mail : ' + error.message)
    });
  }

  /**
  * Vérifie que le nom, l'email et le message ne sont pas vides et que ces derniers ainsi que le numéro de téléphone (s'il est fourni) sont dans un format correct.
  * 
  * @returns {boolean} Retourne `true` si toutes les validations sont passées, sinon `false`.
  */
  validateInputs(): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const telRegex = /^(0[1-9]) (\d{2}) (\d{2}) (\d{2}) (\d{2})$/;

    // Vérification du nom et prénom
    if (!this.nameMail.trim()) {
      alert('Le champ "Nom et prénom" est obligatoire.');
      return false;
    }

    // Vérification de l'email
    if (!this.emailMail.trim()) {
      alert('Le champ "Adresse email" est obligatoire.');
      return false;
    } else if (!emailRegex.test(this.emailMail)) {
      alert('Le format de l\'adresse email est invalide.');
      return false;
    }

    // Vérification du numéro de téléphone
    if (this.phoneNumberMail.trim() && !telRegex.test(this.phoneNumberMail)) {
      alert('Le format du numéro de téléphone est invalide.');
      return false;
    }

    // Vérification du message
    if (!this.messageMail.trim()) {
      alert('Le champ "Message" est obligatoire.');
      return false;
    }

    return true;
  }

}
