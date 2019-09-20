import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SearchInterface } from '../../interfaces/user-config.interface';
import { UserConfigService } from '../../services/user-config.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-searches-grid',
  templateUrl: './searches-grid.component.html',
  styleUrls: ['./searches-grid.component.scss']
})
export class SearchesGridComponent implements OnInit {

  searches: SearchInterface[];

  constructor(
    private authService: AuthService,
    public userConfigService: UserConfigService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.searches = Object.keys(this.userConfigService.userSearches)
      .map(key => this.userConfigService.userSearches[key]);

    // Subscribe to the `UserConfigService.searchesLatest` observable. Each
    // time the searches are updated retrieve them and set them under
    // `this.searches` (in reverse order so that the latest searches appear
    // first).
    this.userConfigService.searchesLatest.subscribe(
      (searches: SearchInterface[]) => {
        if (searches) {
          this.searches = Object.keys(searches)
            .map(key => searches[key]).reverse();
        }
      }
    );
  }

  /**
   * Redirects the user to the new-search page.
   */
  onNewSearch() {
    throw Error('this is a test');
    const result = this.router.navigate(
      ['/app', 'searches', 'new']
    );
    result.then();
  }

  /**
   * Redirects the user to the results summary of a given search.
   * @param searchUuid The search for which the user-results will be displayed.
   */
  onSeeResults(searchUuid: string) {
    const result = this.router.navigate(
      ['/app', 'searches', searchUuid]
    );
    result.then();
  }
}
