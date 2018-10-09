import { Routes } from '@angular/router';
import { HomeComponent } from '../../home/home.component';
import { CallbackComponent } from '../../callback/callback.component';


export const AuthLayoutRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'callback',
    component: CallbackComponent,
  }
];
