import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { SearchesComponent } from '../../searches/searches.component';
import { SearchResultsComponent } from '../../searches/search-results/search-results.component';
import { SearchNewComponent } from '../../searches/search-new/search-new.component';
import { SearchesGridComponent } from '../../searches/searches-grid/searches-grid.component';

export const AdminLayoutRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: {
      breadcrumbs: 'Dashboard'
    }
  },
  {
    path: 'user-profile',
    component: UserProfileComponent
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
        redirectTo: 'grid',
        pathMatch: 'full',
      },
      {
        path: 'grid',
        component: SearchesGridComponent,
        data: {
          breadcrumbs: 'Grid'
        }
      },
      {
        path: 'new',
        component: SearchNewComponent,
        data: {
          breadcrumbs: 'New'
        }
      },
      {
        path: ':id',
        component: SearchResultsComponent,
        data: {
          breadcrumbs: 'Result'
        }
      }
    ]
  },
];
