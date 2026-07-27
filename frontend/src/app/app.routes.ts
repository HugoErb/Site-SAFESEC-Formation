import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  {
    path: 'training-form',
    loadComponent: () => import('./training-form/training-form.component')
      .then(({ TrainingFormComponent }) => TrainingFormComponent)
  },
  {
    path: 'legal-information',
    loadComponent: () => import('./legal-infos/legal-infos.component')
      .then(({ LegalInfosComponent }) => LegalInfosComponent)
  },
  { path: '**', redirectTo: 'home' }
];
