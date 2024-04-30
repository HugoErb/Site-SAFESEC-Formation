import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TrainingFormComponent } from './training-form/training-form.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'training-form', component: TrainingFormComponent }
];
