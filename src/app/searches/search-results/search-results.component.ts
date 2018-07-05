import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ScrollTrackerEventData } from '@nicky-lenaers/ngx-scroll-tracker';

import { SearchesService } from '../../services/searches.service';
import { SearchInterface } from '../../interfaces/search.interface';
import { StudyOverallStatus } from '../../interfaces/study.interface';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  // Number of top locations to display.
  public numLocationsDisplay = 5;
  // Number of top facilities to display.
  public numFacilitiesDisplay = 5;
  // Index of the navigation pill that's initially active.
  private navPillIndexActive = 0;

  // The search the component will display results for.
  public search: SearchInterface;

  // Create a grouping of overall status values to match the template desing.
  overallStatusGroups = {
    recruiting: [
      'Enrolling by invitation',
      'Recruiting',
      'Available'
    ],
    completed: [
      'Completed',
      'Terminated',
      'Withdrawn',
    ],
    active: [],
    all: Object.values(StudyOverallStatus),
  };

  isSaved = false;
  isEditable = false;

  constructor(
    private searchesService: SearchesService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    // Retrieve the referenced search UUID.
    const searchUuid: string = this.route.snapshot.params['searchUuid'];
    // Retrieve the referenced search.
    this.search = this.searchesService.getSearch(searchUuid);

    // Perform the search.
    this.searchesService.searchStudies(searchUuid);
  }

  toggleSaved() {
    this.isSaved = !this.isSaved;
  }

  toggleEditable() {
    this.isEditable = !this.isEditable;
  }

  /**
   * Checks whether a nav-pill should receive the `active` class depending on the
   * current scroll position relative to the result cards.
   * @param {ScrollTrackerEventData} event The scroll event containing information
   * regarding the current scroll position.
   * @param {number} navPillIndex The index of the nav-pill that triggered this
   * event/function and will be evaluated for 'activation'.
   */
  public onScroll(event: ScrollTrackerEventData, navPillIndex: number) {
    // Retrieve the ratios between the tracked element and the container.
    const ratioTop = event.data.elementTop.fromContainerTop.ratio;
    const ratioBottom = event.data.elementTop.fromContainerTop.ratio;

    // Should the ratios fall within given ranges the tracked element is
    // in view thus we set `navPillIndexActive` to the current pill index.
    if (
      (ratioTop < 0.1 && ratioTop > -0.75) &&
      (ratioBottom < 0.1 && ratioBottom > -1.75)
    ) {
      this.navPillIndexActive = navPillIndex;
    }
  }

  /**
   * Checks whether a nav-pill with a given index is supposed to be active or not.
   * @param {number} navPillIndex The index of the nav-pill to be checked.
   * @returns {boolean} Whether the defined nav-pill is supposed to be active or not.
   */
  public isNavPillActive(navPillIndex: number) {
    // Check whether the defined nav-pill is supposed to be active or not.
    return navPillIndex === this.navPillIndexActive;
  }

  /**
   * Count the number of studies whose `overallStatus` has one of the values
   * defined under `overallStatusValues`.
   * @param {string[]} overallStatusValues The possible overall status values
   * for which studies will be counted.
   * @returns {number} The number of studies whose overall status matches one of
   * the values under `overallStatusValues`.
   */
  findCountStudiesOverallStatus(overallStatusValues: string[]): number {
    return this.searchesService.findCountStudiesOverallStatus(
      this.search.searchUuid,
      overallStatusValues
    )
  }


}
