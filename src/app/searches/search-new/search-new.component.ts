import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';

import { TagInterface } from './tag.interface';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit {

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
    {id: 6, name: 'Irritable Bowel Syndrome'},
    {id: 7, name: 'Irritable Bowel Syndrome'},
  ];

  @ViewChild('tagsConditionsInput') tagsConditionsInput: ElementRef;

  constructor() {
    this.tagsConditionsCtrl.valueChanges.subscribe(
      (value => {
        // If the incoming value is of type `string` then perform a filtering
        // and update the `tagsConditionsFiltered` array.
        if (typeof value === 'string') {
          this.filterConditions(value);
        }
      })
    );
  }

  ngOnInit() {
    // Allow all tags to be selected.
    this.tagsConditionsFiltered = this.tagsConditionsAll
  }

  /**
   *
   * @param {string} query The value entered in the input field used to filter the tags.
   */
  filterConditions(query: string): void {

    // Exclude tags that have already been included in `tagsConditionsFiltered`.
    this.tagsConditionsFiltered = this.tagsConditionsAll.filter(tagCondition =>
      this.tagsConditionsSelected.indexOf(tagCondition) === -1
    );

    // If the `query` is an empty string then skip the filtering.
    if (query === '') {
      return
    }

    this.tagsConditionsFiltered = this.tagsConditionsFiltered.filter(tagCondition =>
      tagCondition.name.toLowerCase().indexOf(query.toLowerCase()) === 0
    );
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
