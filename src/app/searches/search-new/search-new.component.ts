import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';
import { Subscription } from 'rxjs/Subscription';

import { TermInterface } from './term.interface';
import { TermFilterConditionsService, TermFilterInterventionsService } from './term-filter.service';
import { TrialsManagerService } from '../trials-manager.service';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit, OnDestroy {

  subscriptionSearch: Subscription;

  form: FormGroup;

  isSaved = false;

  termsFilterConditionsService: TermFilterConditionsService;
  termsFilterInterventionsService: TermFilterInterventionsService;

  termsConditionsFiltered: TermInterface[] = [];
  termsInterventionsFiltered: TermInterface[] = [];

  separatorKeysCodes = [ENTER, COMMA, TAB];

  termsConditionsAll: TermInterface[] = [
    {id: 1, name: 'Bowel Cancer'},
    {id: 2, name: 'Brain Cancer'},
    {id: 3, name: 'Hepatic Carcinoma'},
    {id: 4, name: 'Irritable Bowel Syndrome'},
    {id: 5, name: 'Renal Carcinoma'},
    {id: 6, name: 'Skin Cancer'},
    {id: 7, name: 'Squamous Cell Carcinoma'},
    {id: 8, name: 'Heart Diseases'},
  ];

  termsInterventionsAll: TermInterface[] = [
    {id: 1, name: 'Surgery'},
    {id: 2, name: 'Chemotherapy'},
    {id: 3, name: 'Radiotherapy'},
    {id: 4, name: 'Immunotherapy'},
    {id: 5, name: 'Hyperthermia'},
    {id: 6, name: 'Focused Ultrasound Ablation'},
  ];

  constructor(private trialsManager: TrialsManagerService) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      conditions: new FormControl(null, [Validators.required]),
      interventions: new FormControl(null),
      years: new FormControl([10, 50]),
    });
    this.termsFilterConditionsService = new TermFilterConditionsService(this.termsConditionsAll);
    this.termsFilterInterventionsService = new TermFilterInterventionsService(this.termsInterventionsAll);

    this.termsConditionsFiltered = this.termsConditionsAll;
    this.termsInterventionsFiltered = this.termsInterventionsAll;

    this.form.get('conditions').valueChanges.subscribe(
      (value => {
        // If the incoming value is of type `string` then perform a filtering
        // and update the `tagsConditionsFiltered` array.
        if (typeof value === 'string') {
          this.termsConditionsFiltered = this.termsFilterConditionsService.filterTerms(value, true);
        }
      })
    );

    this.form.get('interventions').valueChanges.subscribe(
      (value => {
        // If the incoming value is of type `string` then perform a filtering
        // and update the `tagsConditionsFiltered` array.
        if (typeof value === 'string') {
          this.termsInterventionsFiltered = this.termsFilterInterventionsService.filterTerms(value, true);
        }
      })
    );
  }

  toggleSaved() {
    this.isSaved = !this.isSaved;
  }

  /**
   * Removes a term from the selected condition terms.
   * @param {TermInterface} term The term to be removed.
   */
  onRemoveTermCondition(term: TermInterface): void {
    this.termsFilterConditionsService.removeTerm(term);
  }

  /**
   * Removes a term from the selected intervention terms.
   * @param {TermInterface} term The term to be removed.
   */
  onRemoveTermIntervention(term: TermInterface): void {
    this.termsFilterInterventionsService.removeTerm(term);
  }

  /**
   * Adds a selected term to the selected condition-terms.
   * @param {MatAutocompleteSelectedEvent} event The selection event.
   */
  onTermConditionSelected(event: MatAutocompleteSelectedEvent): void {
    // Retrieve the selected term.
    const term = event.option.value;
    // Add the term to the selected condition-terms.
    this.termsFilterConditionsService.addTerm(term);
    // Clear the form input's value.
    this.form.get('conditions').setValue('');
  }

  /**
   * Adds a selected term to the selected intervention-terms.
   * @param {MatAutocompleteSelectedEvent} event The selection event.
   */
  onTermInterventionSelected(event: MatAutocompleteSelectedEvent): void {
    // Retrieve the selected term.
    const term = event.option.value;
    // Add the term to the selected intervention-terms.
    this.termsFilterInterventionsService.addTerm(term);
    // Clear the form input's value.
    this.form.get('interventions').setValue('');
  }
  }
}
