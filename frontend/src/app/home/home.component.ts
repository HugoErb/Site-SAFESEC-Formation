import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { faPeopleLine } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  burgerMenuOpened: boolean = false;
  icons = { faLinkedin, faEnvelope, faWheelchair, faCalendarCheck, faGraduationCap, faPeopleLine };

  @ViewChild('menuContainerRef') menuContainerRef!: ElementRef;
  @ViewChild('menuBurger') menuBurger!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.burgerMenuOpened && !this.menuBurger.nativeElement.contains(event.target)) {
      this.burgerMenuOpened = false;
    }
  }

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

  toggleBurgerMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.burgerMenuOpened = !this.burgerMenuOpened;
  }

  sendMail() {
  }
}
