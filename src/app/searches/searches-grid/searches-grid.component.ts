import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SearchesService } from '../../services/searches.service';
import { SearchInterface } from '../../interfaces/search.interface';


@Component({
  selector: 'app-searches-grid',
  templateUrl: './searches-grid.component.html',
  styleUrls: ['./searches-grid.component.scss']
})
export class SearchesGridComponent implements OnInit {

  searches: SearchInterface[];

  constructor(
    private searchesService: SearchesService,
    private router: Router,
  ) {}

  ngOnInit() {

    this.searches = this.searchesService.getSearches();
  }

  onNewSearch() {
    this.router.navigate(['/searches', 'new']);
  }

  onSeeMore(searchUuid: string) {
    this.router.navigate(['/searches', searchUuid]);
  }

}
