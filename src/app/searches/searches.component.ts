import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

import { SearchesService } from './searches.service';
import { SearchModel } from './search.model';

@Component({
  selector: 'app-searches',
  templateUrl: './searches.component.html',
  styleUrls: ['./searches.component.scss']
})
export class SearchesComponent implements OnInit, OnDestroy {

  searches: SearchModel[];
  searchesSubscription: Subscription;

  constructor(
    private searchesService: SearchesService,
    private slimLoadingBarService: SlimLoadingBarService
  ) { }

  ngOnInit() {
    // Start the loading bar.
    this.slimLoadingBarService.start();

    // Subscribe to the searches observable and receive all searches.
    this.searchesSubscription = this.searchesService.searchesObs.subscribe(
      (searches: SearchModel[]) => {
        this.searches = searches;
        this.slimLoadingBarService.complete();
      }
    )
  }

  ngOnDestroy() {
    // Unsubscribe from the searches observable.
    this.searchesSubscription.unsubscribe();
  }

}
