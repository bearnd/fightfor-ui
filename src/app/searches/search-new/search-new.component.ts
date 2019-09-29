import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';
import { debounceTime } from 'rxjs/operators/debounceTime';
import {
  IonRangeSliderCallback,
  IonRangeSliderComponent
} from 'ng2-ion-range-slider';
import { UUID } from 'angular2-uuid';

import {
  DescriptorInterface
} from '../../interfaces/descriptor.interface';
import {
  MeshDescriptorRetrieverService
} from '../../services/mesh-descriptor-retriever.service';
import { AgeRange, DateRange, YearRange } from '../../shared/common.interface';
import {
  StudyStatsRetrieverService
} from '../../services/study-stats-retriever.service';
import { UserConfigService } from '../../services/user-config.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit, OnDestroy {

  // Reference to the input-field element.
  @ViewChild('inputDescriptors') inputDescriptors: ElementRef;
  @ViewChild('sliderYearRange') sliderYearRange: IonRangeSliderComponent;
  @ViewChild('sliderAgeRange') sliderAgeRange: IonRangeSliderComponent;

  // Subscription to the observable returned by `getMeshDescriptorsBySynonym`.
  subscriptionDescriptors: Subscription;

  // `FormGroup` to encompass the form controls.
  form: FormGroup;

  // Arrays to hold the available and selected descriptors.
  descriptorsAll: DescriptorInterface[] = [];
  descriptorsSelected: DescriptorInterface[] = [];
  // Possible start-date year values (to be populated in `ngOnInit`).
  public studyStartDateRangeAll: DateRange = {
    dateBeg: new Date('1900-01-01'),
    dateEnd: new Date('2100-12-31'),
  };
  // Selected start-date year values (to be populated in `ngOnInit`).
  public studyStartYearRangeSelected: YearRange = {
    yearBeg: (new Date).getFullYear() - 5,
    yearEnd: (new Date).getFullYear() + 5,
  };
  // Possible eligibility age-range values in years (to be populated in
  // `ngOnInit`).
  public studyEligibilityAgeRangeAll: AgeRange = {ageBeg: 0, ageEnd: 150};
  public studyEligibilityAgeRangeSelected: AgeRange = {
    ageBeg: 0,
    ageEnd: 150,
  };

  separatorKeysCodes = [ENTER, COMMA, TAB];

  newSearchUuid: string = null;

  constructor(
    private meshDescriptorRetriever: MeshDescriptorRetrieverService,
    private studyStatsRetrieverService: StudyStatsRetrieverService,
    private authService: AuthService,
    private userConfigService: UserConfigService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    // Initialize the form controls.
    this.form = new FormGroup({
      title: new FormControl(null),
      descriptors: new FormControl(
        // Set the initial state to include any pre-defined descriptors
        // navigation to this page included.
        [history.state.descriptor] || null,
        [Validators.required]
      ),
      // Radio buttons for patient-sex.
      radioGender: new FormControl('ALL'),
    });

    // If a descriptor was pre-defined when navigating to this page then update
    // `this.descriptorsSelected` and the form-control.
    if (history.state.descriptor) {
      // Add the descriptor to the selected condition-descriptors.
      this.descriptorsSelected.push(history.state.descriptor);
      // Clear the form input's value.
      this.form.get('descriptors').setValue(null);
      this.inputDescriptors.nativeElement.value = ' ';
    }

    // Query out the date-range of all studies to populate the slider range.
    this.studyStatsRetrieverService.getStartDateRange()
      .subscribe(
      (range: DateRange) => {
        this.studyStartDateRangeAll = range;
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
        this.studyEligibilityAgeRangeSelected.ageBeg =
          this.studyEligibilityAgeRangeAll.ageBeg;
        this.studyEligibilityAgeRangeSelected.ageEnd =
          this.studyEligibilityAgeRangeAll.ageEnd;
      }
    );

    // Subscribe to the `valueChanges` observable of the input control and
    // perform a synonym-search for matching MeSH descriptors with a 400ms
    // debounce so that we don't perform a search for every keystroke.
    this.form.get('descriptors')
      .valueChanges
      .pipe(debounceTime(400))
      .subscribe(
      (value) => {
        // If the incoming value is of type `string` then perform a synonym
        // search through the `meshDescriptorRetriever` service and update
        // `descriptorsAll` with the results.
        if (typeof value === 'string') {
          this.subscriptionDescriptors = this.meshDescriptorRetriever
            .getMeshDescriptorsBySynonym(value, 10)
            .subscribe(
              (response) => {
                this.descriptorsAll = response;
              }
            );
        }
      }
    );

    // Subscribe to the `userConfigService.isCreatingNewSearch` observable.
    this.userConfigService.isCreatingNewSearch.subscribe(
      (isCreating: boolean) => {
        // If the new search UUID has been set (which happens in the `onSubmit`
        // method) and the new search is finished being created then navigate
        // the result summary page for this new search.
        if (!isCreating && this.newSearchUuid !== null) {
          if (this.userConfigService.getUserSearch(this.newSearchUuid)) {
            const result = this.router.navigate(
              ['/app', 'searches', this.newSearchUuid]
            );
            result.then();
          }
        }
      }
    );
  }

  /**
   * Removes a descriptor from the selected descriptors.
   * @param descriptor The descriptor to be removed.
   */
  onRemoveDescriptor(descriptor: DescriptorInterface): void {
    const index = this.descriptorsSelected.indexOf(descriptor);

    if (index >= 0) {
      this.descriptorsSelected.splice(index, 1);
    }
  }

  /**
   * Adds a selected descriptor to the selected descriptors.
   * @param event The selection event.
   */
  onDescriptorSelected(event: MatAutocompleteSelectedEvent): void {
    // Retrieve the selected descriptor.
    const descriptor = event.option.value;
    // Add the descriptor to the selected condition-descriptors.
    this.descriptorsSelected.push(descriptor);
    // Clear the form input's value.
    this.form.get('descriptors').setValue(null);
    this.inputDescriptors.nativeElement.value = ' ';
  }

  /**
   * Creates a new search with the selected parameters via the
   * `UserConfigService`.
   */
  onSubmit() {
    // Retrieve the selected patient-gender (if any).
    let gender: string = null;
    if (this.form.get('radioGender').value) {
      gender = this.form.get('radioGender').value;
    }

    // Create a new UUID for the new search.
    this.newSearchUuid = UUID.UUID();

    // Set the search title based on the value of the form field or set it to
    // the name of the first selected descriptor if the field is left blank.
    let searchTitle: string = null;
    if (this.form.get('title').value) {
      searchTitle = this.form.get('title').value;
    } else {
      searchTitle = this.descriptorsSelected[0].name;
    }

    // Create a new search with the selected parameters.
    this.userConfigService.upsertSearch(
      this.authService.userProfile,
      this.newSearchUuid,
      searchTitle,
      gender,
      this.studyStartYearRangeSelected.yearBeg || null,
      this.studyStartYearRangeSelected.yearEnd || null,
      this.studyEligibilityAgeRangeSelected.ageBeg || null,
      this.studyEligibilityAgeRangeSelected.ageEnd || null,
      this.descriptorsSelected,
    );
  }

  /**
   * Updates the selected year-range based on the slider.
   * @param event The slider event passed when the
   * slider is done being updated.
   */
  onSliderYearRangeFinish(event: IonRangeSliderCallback) {
    this.studyStartYearRangeSelected.yearBeg
      = event.from || this.studyStartDateRangeAll.dateBeg.getFullYear();
    this.studyStartYearRangeSelected.yearEnd
      = event.to || this.studyStartDateRangeAll.dateEnd.getFullYear();
  }

  /**
   * Updates the selected age-range based on the slider.
   * @param event The slider event passed when the
   * slider is done being updated.
   */
  onSliderAgeRangeFinish(event: IonRangeSliderCallback) {
    this.studyEligibilityAgeRangeSelected.ageBeg
      = event.from || this.studyEligibilityAgeRangeAll.ageBeg;
    this.studyEligibilityAgeRangeSelected.ageEnd
      = event.to || this.studyEligibilityAgeRangeAll.ageEnd;
  }

  ngOnDestroy() {
    if (this.subscriptionDescriptors) {
      this.subscriptionDescriptors.unsubscribe();
    }
  }
}
