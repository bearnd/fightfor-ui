import { Injectable } from '@angular/core';



@Injectable()
export class SearchesService {


  constructor() {}

  getSearches() {
    return this.searches;
  }

}
