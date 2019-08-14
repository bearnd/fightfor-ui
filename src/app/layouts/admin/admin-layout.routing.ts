import { Routes } from '@angular/router';

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
import { StudyComponent } from '../../studies/study/study.component';
import { StudiesComponent } from '../../studies/studies.component';
import { FacilitiesListComponent } from '../../facilities/facilities-list/facilities-list.component';
import { FacilitiesComponent } from '../../facilities/facilities.component';


export const AdminLayoutRoutes: Routes = [
  {
    path: '',
    redirectTo: 'searches',
    pathMatch: 'full',
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
        },
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
            path: 'trials',
            component: StudiesComponent,
            canActivate: [PaymentGuard],
            canActivateChild: [PaymentGuard],
            data: {
              breadcrumbs: 'Trials'
            },
            children: [
              {
                path: ':overallStatus',
                component: StudiesListComponent
              },
            ]
          },
          {
            path: 'trial',
            component: StudiesComponent,
            canActivate: [PaymentGuard],
            canActivateChild: [PaymentGuard],
            data: {
              breadcrumbs: 'Trial'
            },
            children: [
              {
                path: ':studyNctId',
                component: StudyComponent,
                data: {
                  breadcrumbs: 'Trial'
                }
              },
            ]
          },
          {
            path: 'institutions',
            component: FacilitiesListComponent,
            canActivate: [PaymentGuard],
            canActivateChild: [PaymentGuard],
            data: {
              breadcrumbs: 'Institutions'
            },
          }
        ],
      },
    ],
  },
  {
    path: 'trials',
    component: StudiesComponent,
    canActivate: [PaymentGuard],
    canActivateChild: [PaymentGuard],
    data: {
      breadcrumbs: 'Trials'
    },
    children: [
      {
        path: '',
        redirectTo: 'saved',
        pathMatch: 'full',
      },
      {
        path: 'saved',
        component: StudiesListComponent,
        data: {
          breadcrumbs: 'Saved'
        },
      },
      {
        path: ':studyNctId',
        component: StudyComponent,
      },
    ],
  }
];
