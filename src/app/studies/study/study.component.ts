import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ScrollTrackerEventData } from '@nicky-lenaers/ngx-scroll-tracker';

import { UserConfigService } from '../../services/user-config.service';
import { StudyRetrieverService } from '../../services/study-retriever.service';
import {
  StudyInterface,
  StudyOverallStatus
} from '../../interfaces/study.interface';
import { Subscription } from 'rxjs/Rx';
import { AgeRange } from '../../shared/common.interface';
import {
  StudyStatsRetrieverService
} from '../../services/study-stats-retriever.service';
import { intervalToSec } from '../../shared/utils';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.scss'],
})
export class StudyComponent implements OnInit, OnDestroy {

  // Index of the navigation pill that's initially active.
  private navPillIndexActive = 0;

  // The study the component will display results for.
  public study: StudyInterface;

  public studyStatusLevel: number = null;
  public studyStatusMessage: string = null;
  public studyCanContact: boolean = null;
  public studyPurposeIndex: number = null;
  public studyPurposeMessage: string = null;
  public isStudySaved: boolean = null;
  // Possible eligibility age-range values in years (to be populated in
  // `ngOnInit`).
  public studyEligibilityAgeRangeAll: AgeRange = {ageBeg: 0, ageEnd: 150};
  public studyEligibilityAgeRange: AgeRange = {ageBeg: 0, ageEnd: 150};

  private subscriptionGetStudyByNctId: Subscription = null;

  constructor(
    public userConfigService: UserConfigService,
    public studyRetrieverService: StudyRetrieverService,
    private studyStatsRetrieverService: StudyStatsRetrieverService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Retrieve the referenced study NCT ID.
    const studyNctId: string = this.route.snapshot.params['studyNctId'];

    // Retrieve the referenced study.
    this.subscriptionGetStudyByNctId = this.studyRetrieverService
      .getStudiesByNctIds([studyNctId]).subscribe(
        (studies: StudyInterface[]) => {
          this.study = studies[0];
          console.log(this.study);
          this.populateConstants();
        }
      );

    // Query out the eligibility age-range of this search's studies to populate
    // the slider range.
    this.studyStatsRetrieverService.getEligibilityAgeRange()
      .subscribe(
      (range: AgeRange) => {
        this.studyEligibilityAgeRangeAll = {
          ageBeg: Math.floor(range.ageBeg / 31536000.0),
          ageEnd: Math.ceil(range.ageEnd / 31536000.0),
        };
      }
    );

  }

  ngOnDestroy() {
    if (this.subscriptionGetStudyByNctId) {
      this.subscriptionGetStudyByNctId.unsubscribe();
    }
  }

  populateConstants() {
    this.studyStatusLevel = this.getStatusLevel();
    this.studyStatusMessage = this.getStatusMessage();
    this.studyCanContact = this.getCanContact();
    this.studyPurposeIndex = this.getPurposeIndex();

    if (this.studyPurposeIndex === 1) {
      this.studyPurposeMessage = 'Testing approaches to prevent or provide ' +
        'support for people with this disease';
    } else if (this.studyPurposeIndex === 2) {
      this.studyPurposeMessage = 'Testing approaches to improve or find new ' +
        'ways to identify diseases';
    } else if (this.studyPurposeIndex === 3) {
      this.studyPurposeMessage = 'Testing new approaches to treat diseases';
    } else if (this.studyPurposeIndex === 4) {
      this.studyPurposeMessage = 'Improve current knowledge of diseases';
    }

    this.studyEligibilityAgeRange.ageBeg
      = intervalToSec(this.study.eligibility.minimumAge) / 31536000.0;
    this.studyEligibilityAgeRange.ageEnd
      = intervalToSec(this.study.eligibility.maximumAge) / 31536000.0;

    console.log(this.studyEligibilityAgeRange);
  }

  /**
   * Retrieves the value of a `StudyOverallStatus` member.
   * @param {StudyOverallStatus} status The enumeration member.
   * @returns {string} The enumeration member value.
   */
  getStatusDescription(status: StudyOverallStatus): string {
    return StudyOverallStatus[status];
  }

  /**
   * Returns a numerical value indicative of the current study's overall status
   * in order appropriately indicate the status of the study in the status
   * timeline.
   * @returns {number} The numerical valud indicative of the study's overall
   * status.
   */
  getStatusLevel() {

    const overallStatus = StudyOverallStatus[this.study.overallStatus];
    
    if (overallStatus === StudyOverallStatus.NOT_YET) {
      return 1;
    } else if (
      overallStatus === StudyOverallStatus.INVITATION ||
      overallStatus === StudyOverallStatus.RECRUITING
    ) {
      return 2;
    } else if (
      overallStatus === StudyOverallStatus.ACTIVE_NOT ||
      overallStatus === StudyOverallStatus.AVAILABLE
    ) {
      return 3;
    } else if (overallStatus === StudyOverallStatus.COMPLETED) {
      return 4;
    } else {
      return 0;
    }
  }

  getStatusMessage() {

    const overallStatus = StudyOverallStatus[this.study.overallStatus];

    let message: string = null;
    if (overallStatus === StudyOverallStatus.NOT_YET) {
      message = 'This trial will be recruiting participants in the future';
    } else if (overallStatus === StudyOverallStatus.INVITATION) {
      message = 'This trial is currently recruiting participants by ' +
        'invitation only. Even if you meet the criteria to be eligible for ' +
        'the study, you may not be able to participate';
    } else if (overallStatus === StudyOverallStatus.RECRUITING) {
      message = 'This trial is currently recruiting participants';
    } else if (overallStatus === StudyOverallStatus.ACTIVE_NOT) {
      message = 'This trial is underway and no longer recruiting participants';
    } else if (overallStatus === StudyOverallStatus.AVAILABLE) {
      message = 'This trial may be recruiting participants, get in touch ' +
        'with the trial contacts to find out more';
    } else if (overallStatus === StudyOverallStatus.COMPLETED) {
      message = 'This trial is complete and is no longer recruiting ' +
        'participants';
    }

    return message;
  }

  getCanContact(): boolean {
    const overallStatus = StudyOverallStatus[this.study.overallStatus];

    return (
      overallStatus === StudyOverallStatus.NOT_YET ||
      overallStatus === StudyOverallStatus.INVITATION ||
      overallStatus === StudyOverallStatus.RECRUITING ||
      overallStatus === StudyOverallStatus.AVAILABLE
    );
  }

  getPurposeIndex() {

    const purpose = this.study.studyDesignInfo.primaryPurpose;

    if (
      purpose === 'Supportive Care' ||
      purpose === 'Prevention'
    ) {
      return 1;
    } else if (
      purpose === 'Diagnostic' ||
      purpose === 'Screening'
    ) {
      return 2;
    } else if (purpose === 'Treatment') {
      return 3;
    } else if (
      purpose === 'Device Feasibility' ||
      purpose === 'Educational/Counseling/Training' ||
      purpose === 'Other' ||
      purpose === 'Health Services Research' ||
      purpose === 'Basic Science'
    ) {
      return 4;
    } else {
      return 0;
    }
  }


  onOverviewContract() {
    // TODO: Scroll to contact.
  }

  onToggleSavedStudy() {
    // TODO: Toggle saving the study under the user.
  }



  /**
   * Checks whether a nav-pill should receive the `active` class depending on
   * the current scroll position relative to the result cards.
   * @param {ScrollTrackerEventData} event The scroll event containing
   * information regarding the current scroll position.
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
   * Checks whether a nav-pill with a given index is supposed to be active or
   * not.
   * @param {number} navPillIndex The index of the nav-pill to be checked.
   * @returns {boolean} Whether the defined nav-pill is supposed to be active or
   * not.
   */
  public isNavPillActive(navPillIndex: number) {
    // Check whether the defined nav-pill is supposed to be active or not.
    return navPillIndex === this.navPillIndexActive;
  }

}
