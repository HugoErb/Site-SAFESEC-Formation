import { Component, ElementRef, HostListener, ViewChild, OnInit, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../common.service';

// Font Awesome Icons
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-training-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './training-form.component.html'
})
export class TrainingFormComponent implements OnInit {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private commonService: CommonService) {
  }
  icons = { faCircleArrowLeft, faBars, faChevronRight, faChevronLeft };
  burgerMenuOpened: boolean = false;

  // Variables pour le mail
  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>;
  public inputLabelMap = new Map<string, string>();
  postalCodeMail: string = "";
  cityMail: string = "";
  countryMail: string = "";
  addressMail: string = "";
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

    // Gestion du calendrier
    this.today = this.getCurrentYear() + this.getCurrentMonth() + ("0" + this.getCurrentDay()).slice(-2);
    this.activeDate = this.getCurrentYear() + this.getCurrentMonth();
    this.populateCalendar(parseInt(this.activeDate.slice(0, 4)), this.activeDate.slice(4, 6));
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

  /**
  * Filtre et formate la saisie d'un numéro de téléphone dans un champ de saisie HTML.
  * Seules les valeurs numériques sont conservées, et un espace est ajouté tous les deux chiffres.
  * Limite la saisie à un maximum de 10 chiffres.
  * 
  * @param event L'événement d'entrée déclenché lors de la saisie dans le champ de saisie.
  *              L'événement doit être de type `Event`.
  */
  formatAndRestrictPhoneInput(event: Event): void {
    this.phoneNumberMail = this.commonService.formatAndRestrictPhoneInput(event);
  }

  /**
  * Filtre et formate la saisie d'un code postal dans un champ de saisie HTML.
  * Seules les valeurs numériques sont conservées.
  * Limite la saisie à un maximum de 5 chiffres et s'assure que la valeur ne dépasse pas 98890.
  * 
  * @param event L'événement d'entrée déclenché lors de la saisie dans le champ de saisie.
  *              L'événement doit être de type `Event`.
  */
  formatAndRestrictPostalCodeInput(event: Event): void {
    let input = event.target as HTMLInputElement;
    let value = input.value;

    // Supprimer tout caractère non numérique
    let numbers = value.replace(/\D/g, '');

    // Limiter à 5 chiffres
    numbers = numbers.slice(0, 5);

    // S'assurer que la valeur ne dépasse pas 98890
    if (parseInt(numbers) > 98890) {
      numbers = '98890';
    }

    // Mettre à jour la valeur du modèle et de l'input
    this.postalCodeMail = numbers;
    input.value = numbers;
  }

  /**
  * Filtre et formate la saisie d'un code postal dans un champ de saisie HTML.
  * Seules les valeurs numériques sont conservées.
  * Limite la saisie à un maximum de 5 chiffres et s'assure que la valeur ne dépasse pas 98890.
  * 
  * @param event L'événement d'entrée déclenché lors de la saisie dans le champ de saisie.
  *              L'événement doit être de type `Event`.
  */
  formatAndRestrictPersonNumberInput(event: Event): void {
    let input = event.target as HTMLInputElement;
    let value = input.value;

    // Supprimer tout caractère non numérique
    let numbers = value.replace(/\D/g, '');

    // Limiter à 2 chiffres
    numbers = numbers.slice(0, 2);

    // S'assurer que la valeur ne dépasse pas 12
    if (parseInt(numbers) > 12) {
      numbers = '12';
    }

    // Mettre à jour la valeur du modèle et de l'input
    this.personNumberMail = numbers;
    input.value = numbers;
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
    console.log(this.inputLabelMap)
    if (await this.commonService.sendMail(this.inputLabelMap, true)) {
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

  // Gestion du calendrier à partir d'ici
  activeDate: string = '';
  activeDay: string = '';
  active: boolean = false;
  days: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  monthes: { [key: string]: string } = {
    '01': 'Janvier',
    '02': 'Février',
    '03': 'Mars',
    '04': 'Avril',
    '05': 'Mai',
    '06': 'Juin',
    '07': 'Juillet',
    '08': 'Août',
    '09': 'Septembre',
    '10': 'Octobre',
    '11': 'Novembre',
    '12': 'Décembre'
  };
  calendarDays: any[] = [];
  cellHeight: string = '';
  swipeLeft: boolean = false;
  swipeRight: boolean = false;
  today: string = '';

  get monthYearFormatted() {
    const month = this.activeDate.slice(4, 6);
    return this.monthes[month] + ' ' + this.activeDate.slice(0, 4);
  }

  get cellHeightUnit() {
    return this.cellHeight + 'px';
  }

  focus() {
    this.active = true;
    const input = document.querySelector('input');
    if (input) {
      this.cellHeight = (input.offsetWidth) / 7 + 'px';
    }
  }

  blur() {
    this.active = false;
  }

  prevent(event: MouseEvent) {
    event.preventDefault();
  }

  getCurrentDate() {
    return new Date().toJSON().slice(0, 10).replace(/-/g, '/');
  }

  getCurrentDay() {
    return new Date().getDate();
  }

  getCurrentMonth() {
    return ("0" + (new Date().getMonth() + 1)).slice(-2);
  }

  getPreviousMonth(month: string) {
    return month === '01' ? '12' : ("0" + (parseInt(month) - 1)).slice(-2);
  }

  getNextMonth(month: string) {
    return month === '12' ? '01' : ("0" + (parseInt(month) + 1)).slice(-2);
  }

  getCurrentYear() {
    return new Date().getFullYear().toString();
  }

  getNumberOfDaysInMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
  }

  getNumberOfDaysInPreviousMonth(year: number, month: string) {
    if (month === '01') {
      return new Date(year - 1, parseInt(this.getPreviousMonth(month)), 0).getDate();
    } else {
      return new Date(year, parseInt(this.getPreviousMonth(month)), 0).getDate();
    }
  }

  getFirstDayOfMonth(year: number, month: number) {
    return (new Date(year, month - 1, 1).getDay() - 1 + 7) % 7;
  }

  populateCalendar(year: number, month: number | string) {
    this.calendarDays = [];
    const firstDayOfMonth = this.getFirstDayOfMonth(year, parseInt(month as string));
    const numberOfDaysInMonth = this.getNumberOfDaysInMonth(year, parseInt(month as string));
    let dayNumber = 1;
    const numberOfRows = Math.ceil((firstDayOfMonth + numberOfDaysInMonth) / 7);
    for (let x = 0; x < numberOfRows; x++) {
      const row = [];
      for (let y = 0; y < 7; y++) {
        if (x === 0 && y < firstDayOfMonth) {
          row.push({
            day: this.getNumberOfDaysInPreviousMonth(year, month as string) - (firstDayOfMonth - y - 1),
            month: this.getPreviousMonth(month as string),
            year: year - (month === '01' ? 1 : 0)
          });
        } else if (dayNumber <= numberOfDaysInMonth) {
          row.push({ day: dayNumber++, month: month, year: year });
        } else {
          row.push({
            day: dayNumber++ - numberOfDaysInMonth,
            month: this.getNextMonth(month as string),
            year: year + (month === '12' ? 1 : 0)
          });
        }
      }
      this.calendarDays.push(row);
    }
  }

  setPreviousMonth() {
    if (!this.isCurrentMonth()) {
      let activeYear = parseInt(this.activeDate.slice(0, 4));
      let activeMonth = this.activeDate.slice(4, 6);
      if (activeMonth === '01') {
        activeYear -= 1;
        activeMonth = '12';
      } else {
        activeMonth = ('0' + (parseInt(activeMonth) - 1)).slice(-2);
      }
      this.activeDate = activeYear + activeMonth;
      this.populateCalendar(activeYear, activeMonth);
      this.animeSwipeRight();
    }
  }

  setNextMonth() {
    let activeYear = parseInt(this.activeDate.slice(0, 4));
    let activeMonth = this.activeDate.slice(4, 6);
    if (activeMonth === '12') {
      activeYear += 1;
      activeMonth = '01';
    } else {
      activeMonth = ('0' + (parseInt(activeMonth) + 1)).slice(-2);
    }
    this.activeDate = activeYear + activeMonth;
    this.populateCalendar(activeYear, activeMonth);
    this.animeSwipeLeft();
  }

  selectDay(cell: any) {
    if (!this.isInPast(cell) && (cell.month === this.activeDate.slice(4, 6))) {
      this.activeDay = ("0" + cell.day).slice(-2) + cell.month + cell.year;
      this.trainingDateMail = ("0" + cell.day).slice(-2) + '/' + cell.month + '/' + cell.year;
      this.active = false;
    }
  }

  isSelected(cell: any) {
    return ("0" + cell.day).slice(-2) + cell.month + cell.year === this.activeDay;
  }

  isDisabled(cell: any) {
    const cellDate = cell.year + cell.month + ("0" + cell.day).slice(-2);
    return cellDate < this.today || cell.month !== this.activeDate.slice(4, 6);
  }

  isInPast(cell: any) {
    const cellDate = cell.year + cell.month + ("0" + cell.day).slice(-2);
    return cellDate < this.today;
  }

  isCurrentMonth() {
    return this.activeDate === this.getCurrentYear() + this.getCurrentMonth();
  }

  animeSwipeLeft() {
    this.swipeLeft = true;
    setTimeout(() => {
      this.swipeLeft = false;
    }, 300);
  }

  animeSwipeRight() {
    this.swipeRight = true;
    setTimeout(() => {
      this.swipeRight = false;
    }, 300);
  }
}

