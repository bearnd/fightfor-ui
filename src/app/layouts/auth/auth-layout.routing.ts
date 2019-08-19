import { Routes } from '@angular/router';

import { HomeComponent } from '../../home/home.component';
import { CallbackComponent } from '../../callback/callback.component';
import { PricingComponent } from '../../pricing/pricing.component';
import { FaqComponent } from '../../faq/faq.component';
import { RoadmapComponent } from '../../roadmap/roadmap.component';


export const AuthLayoutRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'callback',
    component: CallbackComponent,
  },
  {
    path: 'pricing',
    component: PricingComponent,
  },
  {
    path: 'faq',
    component: FaqComponent,
  },
  {
    path: 'roadmap',
    component: RoadmapComponent,
  }
];
