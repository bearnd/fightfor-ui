import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, AfterViewInit, OnDestroy {

  private fragment: string;
  private routerSubscription: Subscription;

  names = [
    "Results01",
    "Results02",
    "Results03",
    "Results04",
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    // this.routerSubscription = this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
    // console.log(this.route.data);
    this.router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = this.router.parseUrl(this.router.url);
        if (tree.fragment) {
          const element = document.querySelector('#' + tree.fragment);
          // if (element) { element.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'}); }
          if (element) { element.scrollIntoView(true); }
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // try {
    //   document.querySelector('#' + this.fragment).scrollIntoView();
    // } catch (e) { }
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

}
