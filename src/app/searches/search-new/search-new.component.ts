import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material';
import {COMMA, ENTER, TAB} from '@angular/cdk/keycodes';

import {TermInterface} from './term.interface';
import {TermFilterConditionsService, TermFilterInterventionsService} from './term-filter.service';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit {

  isSaved = false;

  termsFilterConditionsService: TermFilterConditionsService;
  termsFilterInterventionsService: TermFilterInterventionsService;

  termsConditionsFiltered: TermInterface[] = [];
  termsInterventionsFiltered: TermInterface[] = [];

  separatorKeysCodes = [ENTER, COMMA, TAB];

  termsConditionsCtrl = new FormControl();
  termsInterventionsCtrl = new FormControl();


  termsConditionsAll: TermInterface[] = [
    {id: 1, name: 'Bowel Cancer'},
    {id: 2, name: 'Brain Cancer'},
    {id: 3, name: 'Hepatic Carcinoma'},
    {id: 4, name: 'Irritable Bowel Syndrome'},
    {id: 5, name: 'Renal Carcinoma'},
    {id: 6, name: 'Skin Cancer'},
    {id: 7, name: 'Squamous Cell Carcinoma'},
  ];

  termsInterventionsAll: TermInterface[] = [
    {id: 1, name: 'Surgery'},
    {id: 2, name: 'Chemotherapy'},
    {id: 3, name: 'Radiotherapy'},
    {id: 4, name: 'Immunotherapy'},
    {id: 5, name: 'Hyperthermia'},
    {id: 6, name: 'Focused Ultrasound Ablation'},
  ];

  @ViewChild('termsConditionsInput') termsConditionsInput: ElementRef;
  @ViewChild('termsInterventionsInput') termsInterventionsInput: ElementRef;

  constructor() {
  }

  ngOnInit() {
    this.termsFilterConditionsService = new TermFilterConditionsService(this.termsConditionsAll);
    this.termsFilterInterventionsService = new TermFilterInterventionsService(this.termsInterventionsAll);

    this.termsConditionsFiltered = this.termsConditionsAll;
    this.termsInterventionsFiltered = this.termsInterventionsAll;

    this.termsConditionsCtrl.valueChanges.subscribe(
      (value => {
        // If the incoming value is of type `string` then perform a filtering
        // and update the `tagsConditionsFiltered` array.
        if (typeof value === 'string') {
          this.termsConditionsFiltered = this.termsFilterConditionsService.filterTerms(value, true);
        }
      })
    );

    this.termsInterventionsCtrl.valueChanges.subscribe(
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

  onRemoveTermCondition(term: TermInterface): void {
    this.termsFilterConditionsService.removeTerm(term);
  }

  onRemoveTermIntervention(term: TermInterface): void {
    this.termsFilterInterventionsService.removeTerm(term);
  }

  onTermConditionSelected(event: MatAutocompleteSelectedEvent): void {
    const term = event.option.value;
    this.termsFilterConditionsService.addTerm(term);
    this.termsConditionsInput.nativeElement.value = '';
  }

  onTermInterventionSelected(event: MatAutocompleteSelectedEvent): void {
    const term = event.option.value;
    this.termsFilterInterventionsService.addTerm(term);
    this.termsInterventionsInput.nativeElement.value = '';
  }
}
