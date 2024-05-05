import { Component, ElementRef, HostListener, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MailService } from '../mail.service';

import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-training-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, InputTextareaModule, InputTextModule, InputNumberModule],
  templateUrl: './training-form.component.html'
})
export class TrainingFormComponent implements OnInit {
  constructor(private router: Router, private mailService: MailService, private activatedRoute: ActivatedRoute) {
    this.todayDate = new Date();
  }
  burgerMenuOpened: boolean = false;
  todayDate: Date;
  
  // Variables pour le mail
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

  sendMail() {

    // On vérifie les données
    // if (!this.validateInputs(name, email, tel, message)) {
    //   return;
    // }

    var name = this.nameMail
    var email = this.emailMail
    var tel = this.phoneNumberMail
    var message = this.moreInformationMail

    const mailData = { name, email, tel, message };
    this.mailService.sendMail(mailData).subscribe({
      next: (response) => alert('Mail envoyé avec succès !'),
      error: (error) => alert('Erreur lors de l\'envoi du mail : ' + error.message)
    });
  }
}
