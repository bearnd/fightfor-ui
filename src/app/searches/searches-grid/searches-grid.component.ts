import { Component, OnInit } from '@angular/core';
import {SearchesService} from '../searches.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchModel} from '../search.model';
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';

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
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Start the loading bar.
    this.slimLoadingBarService.start();

    this.searches = this.searchesService.searches;
    this.slimLoadingBarService.complete();
    // this.searchesService.searchesObs.subscribe(
    //   (searches: SearchModel[]) => {
    //     this.searches = searches;
    //     this.slimLoadingBarService.complete();
    //   }
    // );
  }

  onNewSearch() {
    this.router.navigate(['/searches', 'new']);
  }

  onSeeMore(searchIdx: number) {
    this.router.navigate(['/searches', searchIdx]);
  }

}
