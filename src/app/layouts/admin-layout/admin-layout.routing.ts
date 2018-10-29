import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { SearchesComponent } from '../../searches/searches.component';
import {
  SearchResultsComponent
} from '../../searches/search-results/search-results.component';
import {
  SearchNewComponent
} from '../../searches/search-new/search-new.component';
import {
  SearchesGridComponent
} from '../../searches/searches-grid/searches-grid.component';
import {
  SearchResultsSummaryComponent
} from '../../searches/search-results/search-results-summary/search-results-summary.component';
import {
  StudiesListComponent
} from '../../studies/studies-list/studies-list.component';
import { PaymentGuard } from '../../guards/payment.guard';


export const AdminLayoutRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: {
      breadcrumbs: 'Dashboard'
    }
  },
  {
    path: 'searches',
    component: SearchesComponent,
    data: {
      breadcrumbs: 'Searches'
    },
    children: [
      {
        path: '',
        component: SearchesGridComponent,
      },
      {
        path: 'new',
        component: SearchNewComponent,
        data: {
          breadcrumbs: 'New'
        }
      },
      {
        path: ':searchUuid',
        component: SearchResultsComponent,
        data: {
          breadcrumbs: 'Search'
        },
        children: [
          {
            path: '',
            redirectTo: 'summary',
            pathMatch: 'full',
          },
          {
            path: 'summary',
            component: SearchResultsSummaryComponent,
            data: {
              breadcrumbs: 'Summary'
            }
          },
          {
            canActivate: [PaymentGuard],
            canActivateChild: [PaymentGuard],
            path: 'trials/:overallStatus',
            component: StudiesListComponent,
            data: {
              breadcrumbs: 'Trials'
            },
          },
        ],
      },
    ],
  },
];
