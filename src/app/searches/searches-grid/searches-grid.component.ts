import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

import { SearchesService } from '../../services/searches.service';
import { SearchModel } from '../search.model';


@Component({
  selector: 'app-searches-grid',
  templateUrl: './searches-grid.component.html',
  styleUrls: ['./searches-grid.component.scss']
})
export class SearchesGridComponent implements OnInit {

  searches: SearchModel[];

  constructor(
    private searchesService: SearchesService,
    private slimLoadingBarService: SlimLoadingBarService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Start the loading bar.
    this.slimLoadingBarService.start();

    this.searches = this.searchesService.searches;
    this.slimLoadingBarService.complete();
  }

  onNewSearch() {
    this.router.navigate(['/searches', 'new']);
  }

  onSeeMore(searchIdx: number) {
    this.router.navigate(['/searches', searchIdx]);
  }

}
