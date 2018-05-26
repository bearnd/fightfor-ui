import { Component, OnInit} from '@angular/core';
import { ScrollTrackerEventData } from '@nicky-lenaers/ngx-scroll-tracker';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  private navPillIndexActive = 0;

  names = [
    'Results01',
    'Results02',
    'Results03',
    'Results04',
  ];
  constructor() { }

  ngOnInit() { }

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
}
