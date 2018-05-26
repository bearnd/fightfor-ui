import {Component, OnDestroy, OnInit} from '@angular/core';
import {IBreadcrumb, McBreadcrumbsService} from 'ngx-breadcrumbs';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {

  subscription: Subscription;
  breadcrumbs: IBreadcrumb[];

  constructor(
    private breadcrumbsService: McBreadcrumbsService,
  ) {
  }

  ngOnInit() {
    this.subscription = this.breadcrumbsService.crumbs$.subscribe(
      (breadcrumbs: IBreadcrumb[]) => {
        this.breadcrumbs = breadcrumbs;
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
