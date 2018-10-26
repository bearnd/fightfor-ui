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
  MeshDescriptorInterface
} from '../../interfaces/mesh-descriptor.interface';
import {
  MeshDescriptorRetrieverService
} from '../../services/mesh-descriptor-retriever.service';
import { AgeRange, DateRange, YearRange } from '../../shared/common.interface';
import {
  StudyStatsRetrieverService
} from '../../services/study-stats-retriever.service';
import { UserConfigService } from '../../services/user-config.service';
import { AuthService } from '../../services/auth.service';
import { SearchInterface } from '../../interfaces/user-config.interface';


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
  descriptorsAll: MeshDescriptorInterface[] = [];
  descriptorsSelected: MeshDescriptorInterface[] = [];
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
    ageBeg: null,
    ageEnd: null,
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
        null,
        [Validators.required]
      ),
      // Radio buttons for patient-sex.
      radioGender: new FormControl(null),
    });

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
            result.finally();
          }
        }
      }
    )
  }

  /**
   * Removes a descriptor from the selected descriptors.
   * @param {MeshDescriptorInterface} descriptor The descriptor to be removed.
   */
  onRemoveDescriptor(descriptor: MeshDescriptorInterface): void {
    const index = this.descriptorsSelected.indexOf(descriptor);

    if (index >= 0) {
      this.descriptorsSelected.splice(index, 1);
    }
  }

  /**
   * Adds a selected descriptor to the selected descriptors.
   * @param {MatAutocompleteSelectedEvent} event The selection event.
   */
  onDescriptorSelected(event: MatAutocompleteSelectedEvent): void {
    // Retrieve the selected descriptor.
    const descriptor = event.option.value;
    // Add the descriptor to the selected condition-descriptors.
    this.descriptorsSelected.push(descriptor);
    // Clear the form input's value.
    this.form.get('descriptors').setValue(null);
    this.inputDescriptors.nativeElement.value = '';
  }

  /**
   * Creates a new search with the selected descriptors and navigates to the
   * results-summary page where the search is performed.
   */
  onSubmit() {

    let gender: string = null;

    // Retrieve the selected patient-gender (if any).
    if (this.form.get('radioGender').value) {
      gender = this.form.get('radioGender').value;
    }

    // Create a new search with the selected descriptors.
    const search: SearchInterface = this.searches.createSearch(
      this.descriptorsSelected,
      patientGender || null,
      this.studyStartYearRangeSelected.yearBeg || null,
      this.studyStartYearRangeSelected.yearEnd || null,
      this.studyEligibilityAgeRangeAll.ageBeg || null,
      this.studyEligibilityAgeRangeAll.ageEnd || null,
    );

    // Navigate to the `SearchResultsComponent` with the new search.
    this.router.navigate(['/app', 'searches', search.searchUuid]);
  }

  onSliderYearRangeFinish(event: IonRangeSliderCallback) {
    this.studyStartYearRangeSelected.yearBeg = event.from || null;
    this.studyStartYearRangeSelected.yearEnd = event.to || null;
  }

  onSliderAgeRangeFinish(event: IonRangeSliderCallback) {
    this.studyEligibilityAgeRangeSelected.ageBeg = event.from || null;
    this.studyEligibilityAgeRangeSelected.ageEnd = event.to || null;
  }

  ngOnDestroy() {
    if (this.subscriptionDescriptors) {
      this.subscriptionDescriptors.unsubscribe();
    }
  }
}
