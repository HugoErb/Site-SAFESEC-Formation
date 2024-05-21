import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TrainingFormComponent } from './training-form/training-form.component';
import { LegalInfosComponent } from './legal-infos/legal-infos.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'training-form', component: TrainingFormComponent },
  { path: 'legal-information', component: LegalInfosComponent }
];
