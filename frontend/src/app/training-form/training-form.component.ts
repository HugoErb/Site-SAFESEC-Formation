import { Component, ElementRef, HostListener, ViewChild, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MailService } from '../mail.service';
import Swal from 'sweetalert2';

// Prime NG
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

// Font Awesome Icons
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleArrowLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-training-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, InputTextareaModule, InputTextModule, InputNumberModule, FontAwesomeModule,],
  templateUrl: './training-form.component.html'
})
export class TrainingFormComponent implements OnInit {
  constructor(private router: Router, private mailService: MailService, private activatedRoute: ActivatedRoute) {
    this.todayDate = new Date();
  }
  icons = { faCircleArrowLeft };
  burgerMenuOpened: boolean = false;
  todayDate: Date;

  // Variables pour le mail
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  public inputLabelMap = new Map<string, string>();
  postalCodeMail: string = "";
  cityMail: string = "";
  countryMail: string = "";
  adressMail: string = "";
  nameMail: string = "";
  emailMail: string = "";
  phoneNumberMail: string = "";
  companyMail: string = "";
  chosenTrainingName = "";
  personNumberMail: string = "";
  jobTrainedMail: string = "";
  trainingDateMail: string = "";
  moreInformationMail: string = "";

  ngOnInit() {

    // On récupère le nom de la formation de la page home
    if (this.activatedRoute.snapshot.params.hasOwnProperty('chosenTrainingName')) {
      this.chosenTrainingName = this.activatedRoute.snapshot.params['chosenTrainingName'];
    }
  }

  @ViewChild('menuContainerRef') menuContainerRef!: ElementRef;
  @ViewChild('menuBurger') menuBurger!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.burgerMenuOpened && !this.menuBurger.nativeElement.contains(event.target)) {
      this.burgerMenuOpened = false;
    }
  }

  navigateToHome(section: string) {
    this.router.navigate(['home', { redirectionSection: section }]);
  }

  toggleBurgerMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.burgerMenuOpened = !this.burgerMenuOpened;
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
  sendMail() {

    this.getDataIntoDictionary();

    // On vérifie les données
    if (!this.validateInputs()) {
      return;
    }

    const mailData = { name: this.nameMail, email: this.emailMail, tel: this.phoneNumberMail, message: this.messageMail };
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
  * @returns {boolean} Retourne `true` si toutes les validations sont passées, sinon `false`.
  */
  validateInputs(): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const telRegex = /^(0[1-9]) (\d{2}) (\d{2}) (\d{2}) (\d{2})$/;

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

      // Vérification spécifique pour l'email
      if (label.toLowerCase().includes('email') && !emailRegex.test(trimmedValue)) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur de saisie',
          text: 'Le format de l\'adresse email est invalide.',
          confirmButtonColor: "#3B82F6"
        })
        return false;
      }

      // Vérification spécifique pour le numéro de téléphone
      if (label.toLowerCase().includes('téléphone') && !telRegex.test(trimmedValue)) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur de saisie',
          text: 'Le format du numéro de téléphone est invalide.',
          confirmButtonColor: "#3B82F6"
        })
        return false;
      }
    }

    // Ajouter d'autres validations spécifiques si nécessaire
    return true;
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
