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
import {
  StudyBreadcrumbResolverService
} from '../../components/navbar/breadcrumbs/resolvers/study-breadcrumb-resolver.service';
import {
  StudiesBreadcrumbResolverService
} from '../../components/navbar/breadcrumbs/resolvers/studies-breadcrumb-resolver.service';


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
            children: [
              {
                path: ':overallStatus',
                component: StudiesListComponent,
                data: {
                  breadcrumbs: StudiesBreadcrumbResolverService,
                },
              },
              {
                path: ':overallStatus/trial',
                component: StudiesComponent,
                data: {
                  breadcrumbs: StudiesBreadcrumbResolverService,
                },
                children: [
                  {
                    path: ':studyNctId',
                    component: StudyComponent,
                    data: {
                      breadcrumbs: StudyBreadcrumbResolverService,
                    },
                  }
                ]
              }
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
        data: {
          breadcrumbs: StudyBreadcrumbResolverService,
        },
      },
    ],
  }
];
