import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { McBreadcrumbsResolver } from 'ngx-breadcrumbs';
import { IBreadcrumb } from 'ngx-breadcrumbs/src/mc-breadcrumbs.shared';

@Injectable()
export class StudiesBreadcrumbResolverService extends McBreadcrumbsResolver {

  constructor() {
    super();
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    console.log(route);
    const overallStatus = route.params.overallStatus;
    const overallStatusCapitalized
      = overallStatus[0].toUpperCase() + overallStatus.substring(1);

    const crumbs: IBreadcrumb[] = [{
      text: 'Trials (' + overallStatusCapitalized + ')',
      path: super.getFullPath(route.parent) + '/' + overallStatus,
    }];
    return crumbs;
  }
}
