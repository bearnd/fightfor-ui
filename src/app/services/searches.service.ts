import { Injectable } from '@angular/core';

import { SearchModel } from '../searches/search.model';


@Injectable()
export class SearchesService {

  searches = [
    new SearchModel(
      'Search 01',
      'This is a search',
    ),
    new SearchModel(
      'Search 02',
      'This is a search',
    ),
    new SearchModel(
      'Search 03',
      'This is a search',
    )
  ];

  constructor() {}

  getSearches() {
    return this.searches;
  }

}
