import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { McBreadcrumbsResolver } from 'ngx-breadcrumbs';
import { IBreadcrumb } from 'ngx-breadcrumbs/src/mc-breadcrumbs.shared';

@Injectable()
export class StudyBreadcrumbResolverService extends McBreadcrumbsResolver {

  constructor() {
    super();
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const studyNctId = route.params.studyNctId;

    const crumbs: IBreadcrumb[] = [{
      text: 'Trial (' + studyNctId + ')',
      path: super.getFullPath(route.parent) + '/' + studyNctId,
    }];
    return crumbs;
  }
}
