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
    private userConfigService: UserConfigService,
    private router: Router,
  ) {}

  ngOnInit() {

    this.searches = this.searchesService.getSearches();
  }

  /**
   * Redirects the user to the new-search page.
   */
  onNewSearch() {
    const result = this.router.navigate(
      ['/app', 'searches', 'new']
    );
    result.finally();
  }
  }

  /**
   * Redirects the user to the results summary of a given search.
   * @param {string} searchUuid The search for which the user-results will be
   * displayed.
   */
  onSeeResults(searchUuid: string) {
    const result = this.router.navigate(
      ['/app', 'searches', searchUuid]
    );
    result.finally();
  }

}
