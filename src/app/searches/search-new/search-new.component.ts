import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';

import { TagInterface } from './tag.interface';
import * as Fuse from 'fuse.js';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit {

  isSaved = false;

  // Options for fuzzy-seaching via Fuse.js.
  optionsFuse = {
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

  separatorKeysCodes = [ENTER, COMMA, TAB];

  tagsConditionsCtrl = new FormControl();

  tagsConditionsFiltered: TagInterface[] = [];

  tagsConditionsSelected: TagInterface[] = [];

  tagsConditionsAll: TagInterface[] = [
    {id: 1, name: 'Bowel Cancer'},
    {id: 2, name: 'Brain Cancer'},
    {id: 3, name: 'Hepatic Carcinoma'},
    {id: 4, name: 'Irritable Bowel Syndrome'},
    {id: 5, name: 'Renal Carcinoma'},
    {id: 6, name: 'Skin Cancer'},
    {id: 7, name: 'Squamous Cell Carcinoma'},
  ];

  tagsInterventionsAll: TagInterface[] = [
    {id: 1, name: 'Surgery'},
    {id: 2, name: 'Chemotherapy'},
    {id: 3, name: 'Radiotherapy'},
    {id: 4, name: 'Immunotherapy'},
    {id: 5, name: 'Hyperthermia'},
    {id: 6, name: 'Focused Ultrasound Ablation'},
  ];

  @ViewChild('tagsConditionsInput') tagsConditionsInput: ElementRef;

  constructor() {
    this.tagsConditionsCtrl.valueChanges.subscribe(
      (value => {
        // If the incoming value is of type `string` then perform a filtering
        // and update the `tagsConditionsFiltered` array.
        if (typeof value === 'string') {
          this.tagsConditionsFiltered = this.filterTags(this.tagsConditionsAll, this.tagsConditionsSelected, value);
        }
      })
    );
  }

  ngOnInit() {
    // Allow all tags to be selected.
    this.tagsConditionsFiltered = this.tagsConditionsAll;
  }

  toggleSaved() {
    this.isSaved = !this.isSaved;
  }

  filterTags(
    tagsAll: TagInterface[],
    tagsSelected: TagInterface[],
    query: string,
  ): TagInterface[] {

    let tagsFiltered: TagInterface[];

    // Exclude tags that have already been included in `tagsConditionsFiltered`.
    tagsFiltered = tagsAll.filter(tagCondition =>
      tagsSelected.indexOf(tagCondition) === -1
    );

    // If the `query` is an empty string then skip the filtering.
    if (query === '') {
      return tagsFiltered;
    }

    // Create a new `Fuse` search object with the predefined options.
    const fuse = new Fuse(tagsFiltered, this.optionsFuse);

    // Perform a fuzzy-search through the tag names using the query.
    tagsFiltered = fuse.search(query);

    return tagsFiltered;
  }

  /**
   * Removes a tag from `tagsConditionsSelected`.
   * @param {TagInterface} tag The tag object to be removed.
   */
  onRemoveTagCondition(tag: TagInterface): void {
    const index = this.tagsConditionsSelected.indexOf(tag);

    if (index >= 0) {
      this.tagsConditionsSelected.splice(index, 1);
    }
  }

  onSelected(event: MatAutocompleteSelectedEvent): void {
    const tagSelected = event.option.value;
    this.tagsConditionsSelected.push(tagSelected);
    this.tagsConditionsInput.nativeElement.value = '';
  }
}
