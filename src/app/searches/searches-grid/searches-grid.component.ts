import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { SearchInterface } from '../../interfaces/user-config.interface';
import { UserConfigService } from '../../services/user-config.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-searches-grid',
  templateUrl: './searches-grid.component.html',
  styleUrls: ['./searches-grid.component.scss']
})
export class SearchesGridComponent implements OnInit, OnDestroy {

  // Subscription to the `userConfigService.searchesLatest` behavior-subject.
  subscriptionSearchesLatest: Subscription = null;

  searches: SearchInterface[];

  constructor(
    private authService: AuthService,
    public userConfigService: UserConfigService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Copy the user's searches from the `UserConfigService` and store them
    // in reverse order.
    this.searches = Object.keys(this.userConfigService.userSearches)
      .map(key => this.userConfigService.userSearches[key]).reverse();

    // Subscribe to the searchesLatest behavior subject and replace the
    // user's searches whenever they are updated.
    this.subscriptionSearchesLatest = this.userConfigService
      .searchesLatest.subscribe(
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
    const result = this.router.navigate(
      ['/app', 'searches', 'new']
    );
    result.then();
  }

  /**
   * Deletes a given search via its UUID and the `UserConfigService`.
   * @param searchUuid The UUID of the search to be deleted.
   */
  onDeleteSearch(searchUuid: string) {
    this.userConfigService.deleteSearch(
      this.authService.userProfile,
      searchUuid,
    );
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

  ngOnDestroy(): void {
    if (this.subscriptionSearchesLatest) {
      this.subscriptionSearchesLatest.unsubscribe();
    }
  }
}
