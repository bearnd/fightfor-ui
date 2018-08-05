import { Injectable } from '@angular/core';

import { UUID } from 'angular2-uuid';

import { SearchInterface } from '../interfaces/search.interface';
import {
  MeshDescriptorInterface
} from '../interfaces/mesh-descriptor.interface';
import { searchSample } from './search-example';


@Injectable()
export class SearchesService {

  // Object to hold `SearchInterface` objects under their UUID.
  public searches = {};

  constructor() {

    // TODO: REMOVE
    this.searches['7c2f8f55-c44a-7ccd-5576-6cb0eec129f0'] = searchSample;
  }

  /**
   * Returns all searches currently managed by this service without exposing
   * the private `searches` member.
   * @returns {SearchInterface[]} The searches managed by this service.
   */
  getSearches(): SearchInterface[] {
    return Object.values(this.searches);
  }

  /**
   * Creates a new search under a unique UUID and stores it under
   * `this.searches`.
   * @param {MeshDescriptorInterface[]} descriptors The MeSH descriptors
   * selected for this search.
   * @returns {SearchInterface} The created search.
   */
  createSearch(descriptors: MeshDescriptorInterface[]) {
    // Create a new UUID for the new search.
    const searchUuid = UUID.UUID();

    // Create a new search.
    const search: SearchInterface = {
      searchUuid: searchUuid,
      descriptors: descriptors,
      studiesStats: {},
    };

    // Add the new search under its UUID in the `this.searches` object.
    this.searches[searchUuid] = search;

    return search;
  }

  /**
   * Retrieve a search through its UUID.
   * @param {string} searchUuid The UUID for which a search will be retrieved.
   * @returns {SearchInterface | null} The matching search or `null` if none was
   * found.
   */
  getSearch(searchUuid: string): SearchInterface | null {
    if (this.searches.hasOwnProperty(searchUuid)) {
      return this.searches[searchUuid];
    } else {
      return null;
    }
  }

}

