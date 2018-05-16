import {TermsFilterServiceInterface} from './term-filter-service.interface';
import {TermInterface} from './term.interface';

import * as Fuse from 'fuse.js';
import {FuseOptions} from 'fuse.js';


export class TermsFilterServiceBase implements TermsFilterServiceInterface {

  fuseOptions: FuseOptions = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      'name',
    ]
  };

  public termsAll: TermInterface[];
  public termsSelected: TermInterface[];

  constructor(termsAll: TermInterface[]) {
    this.termsAll = termsAll;
    this.termsSelected = [];
  }

  addTerm(term: TermInterface): void {
    this.termsSelected.push(term);
  }

  removeTerm(term: TermInterface): void {
    const index = this.termsSelected.indexOf(term);

    if (index >= 0) {
      this.termsSelected.splice(index, 1);
    }
  }

  filterTerms(
    query: string,
    doExcludeSelected: boolean = true,
  ): TermInterface[] {

    let termsFiltered: TermInterface[];

    // (Optionally) exclude terms that have already been included in `termsSelected`.
    if (doExcludeSelected) {
      termsFiltered = this.termsAll.filter(term =>
        this.termsSelected.indexOf(term) === -1
      );
    }

    // If the `query` is an empty string then skip the filtering.
    if (query === '') {
      return termsFiltered;
    }

    // Create a new `Fuse` search object with the predefined options.
    const fuse = new Fuse(termsFiltered, this.fuseOptions);

    // Perform a fuzzy-search through the tag names using the query.
    termsFiltered = fuse.search(query);

    return termsFiltered;
  }
}

export class TermFilterConditionsService extends TermsFilterServiceBase {
  constructor(public termsAll: TermInterface[]) {
    super(termsAll);
  }
}

export class TermFilterInterventionsService extends TermsFilterServiceBase {
  constructor(public termsAll: TermInterface[]) {
    super(termsAll);
  }
}
