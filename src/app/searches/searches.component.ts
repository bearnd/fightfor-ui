import {Component, OnDestroy, OnInit} from '@angular/core';
import { SearchesService } from './searches.service';
import { SearchModel } from './search.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-searches',
  templateUrl: './searches.component.html',
  styleUrls: ['./searches.component.scss']
})
export class SearchesComponent implements OnInit, OnDestroy {

  searches: SearchModel[];
  searchesSubscription: Subscription;

  constructor(private searchesService: SearchesService) { }

  ngOnInit() {
    this.searchesSubscription = this.searchesService.searchesObs.subscribe(
      (searches: SearchModel[]) => {
        this.searches = searches;
      }
    )
  }

  ngOnDestroy() {
    this.searchesSubscription.unsubscribe();
  }

}
