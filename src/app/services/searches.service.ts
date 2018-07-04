import { Injectable } from '@angular/core';

import { UUID } from 'angular2-uuid';
import { Subject } from 'rxjs/Subject';

import { SearchInterface } from '../interfaces/search.interface';
import { MeshDescriptorInterface } from '../interfaces/mesh-descriptor.interface';
import { StudyRetrieverService } from './study-retriever.service';
import { StudyStatsRetrieverService } from './study-stats-retriever.service';
import { searchSample } from './search-example';


@Injectable()
export class SearchesService {

  public searches = {};

  searchStudiesUpdated = new Subject<string>();

  constructor(
    private studyRetrieverService: StudyRetrieverService,
    private studyStatsRetrieverService: StudyStatsRetrieverService
  ) {
    this.searchStudiesUpdated.subscribe(
      (searchUuid: string) => {
        this.getCountStudiesByCountry(searchUuid);
        this.getCountStudiesByOverallStatus(searchUuid);
        this.getCountStudiesByFacility(searchUuid, 5);
      }
    );
  }

  getSearches(): SearchInterface[] {
    return Object.values(this.searches);
  }

  /**
   * Creates a new search under a unique UUID and stores it under
   * `this.searches`.
   * @param {MeshDescriptorInterface[]} descriptors The MeSH
   * descriptors selected for this search.
   * @returns {SearchInterface} The created search.
   */
  createSearch(
    descriptors: MeshDescriptorInterface[],
  ) {

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

  /**
   * Retrieve the clinical-trial studies corresponding to the selected
   * descriptors of a given search. The search is performed via the
   * `StudyRetrieverService`.
   * @param {string} searchUuid The UUID of the search for which studies will
   * be retrieved.
   */
  searchStudies(searchUuid: string) {
    // Retrieve the referenced search.
    const search: SearchInterface = this.getSearch(searchUuid);

    // If the search already contains `studies` that means the search has
    // already been performed.
    if (!search.studies) {
      // Perform the search retrieving the clinical-trial studies and setting
      // them under the search object.
      this.studyRetrieverService
        .searchStudies(search.descriptors)
        .subscribe(
          (response) => {
            search.studies = response;
            this.searchStudiesUpdated.next(searchUuid);
          }
        );
    }
  }

  /**
   * Retrieve the count of clinical-trial studies by country for the studies
   * previously attributed to a given search. The search is performed via the
   * `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   *
   * @param {string} searchUuid The UUID of the search for which study stats
   * will be retrieved.
   */
  getCountStudiesByCountry(searchUuid: string) {
    // Retrieve the referenced search.
    const search: SearchInterface = this.getSearch(searchUuid);

    // Perform the search.
    this.studyStatsRetrieverService
      .getCountStudiesByCountry(search.studies)
      .subscribe(
        (response) => {
          search.studiesStats.byCountry = response;
        }
      );
  }

  /**
   * Retrieve the count of clinical-trial studies by overall status for the
   * studies previously attributed to a given search. The search is performed
   * via the `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   *
   * @param {string} searchUuid The UUID of the search for which study stats
   * will be retrieved.
   */
  getCountStudiesByOverallStatus(searchUuid: string) {
    // Retrieve the referenced search.
    const search: SearchInterface = this.getSearch(searchUuid);

    // Perform the search.
    this.studyStatsRetrieverService
      .getCountStudiesByOverallStatus(search.studies)
      .subscribe(
        (response) => {
          search.studiesStats.byOverallStatus = response;
        }
      );
  }

  /**
   * Retrieve the count of clinical-trial studies by facility for the studies
   * previously attributed to a given search. The search is performed via the
   * `StudyStatsRetrieverService`.
   *
   * This function assumes that the `searchStudies` function has been previously
   * run for the given search and that its `studies` property is populated.
   *
   * @param {string} searchUuid The UUID of the search for which study stats
   * will be retrieved.
   * @param {number} limit The number of facilities (in an order of descending
   * number of studies) to be returned.
   */
  getCountStudiesByFacility(searchUuid: string, limit?: number) {
    // Retrieve the referenced search.
    const search: SearchInterface = this.getSearch(searchUuid);

    // Perform the search.
    this.studyStatsRetrieverService
      .getCountStudiesByFacility(search.studies, limit)
      .subscribe(
        (response) => {
          search.studiesStats.byFacility = response;
        }
      );
  }

  /**
   * Count the number of studies whose `overallStatus` has one of the values
   * defined under `overallStatusValues`.
   *
   * This function assumes that the `getCountStudiesByOverallStatus` function
   * has been previously run for the given search and that its
   * `studiesStats.byOverallStatus` property is populated.
   *
   * @param {string} searchUuid The UUID of the search for which study stats
   * will be retrieved.
   * @param {string[]} overallStatusValues The possible overall status values
   * for which studies will be counted.
   * @returns {number} The number of studies whose overall status matches one of
   * the values under `overallStatusValues`.
   */
  findCountStudiesOverallStatus(
    searchUuid: string,
    overallStatusValues: string[],
  ): number {
    // Retrieve the referenced search.
    const search: SearchInterface = this.getSearch(searchUuid);

    // Initialize the count.
    let count = 0;

    // Iterate over the count of studies by overall status and add the number
    // of studies if their overall status is one of those defined under
    // `overallStatusValues`.
    for (const entry of search.studiesStats.byOverallStatus) {
      if (overallStatusValues.indexOf(entry.overallStatus) !== -1) {
        count += entry.countStudies;
      }
    }

    return count;
  }

}

