import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';

import { Observable } from 'rxjs/Observable';
import { map, startWith } from 'rxjs/operators';
import { TagInterface } from './tag.interface';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit {

  addOnBlur: boolean = false;

  separatorKeysCodes = [ENTER, COMMA, TAB];

  tagsConditionsCtrl = new FormControl();

  tagsConditionsFiltered: Observable<any[]>;

  tagsConditions: TagInterface[] = [];

  tagsConditionsAll: TagInterface[] = [
    {id: 1, name: 'Bowel Cancer'},
    {id: 2, name: 'Brain Cancer'},
    {id: 3, name: 'Hepatic Carcinoma'},
    {id: 4, name: 'Irritable Bowel Syndrome'},
    {id: 5, name: 'Renal Carcinoma'},
    {id: 6, name: 'Irritable Bowel Syndrome'},
    {id: 7, name: 'Irritable Bowel Syndrome'},
  ];

  tagsConditionsAllValues = this.tagsConditionsAll.map(x => x.name);

  @ViewChild('tagsConditionsInput') tagsConditionsInput: ElementRef;

  constructor() {
    this.tagsConditionsFiltered = this.tagsConditionsCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => tag ? this.onFilter(tag) : this.tagsConditionsAllValues)
    )
  }

  ngOnInit() {}

  onAddTagCondition(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add the new condition-tag to the array.
    if ((value || '').trim()) {
      this.tagsConditions.push({name: value.trim()});
    }

    // Reset the input value to an empty string.
    if (input) {
      input.value = '';
    }
  }

  onRemoveTagCondition(tag: TagInterface): void {
    const index = this.tagsConditions.indexOf(tag);

    if (index >= 0) {
      this.tagsConditions.splice(index, 1);
    }
  }

  onFilter(name: string) {

    const result = this.tagsConditionsAllValues.filter(tag =>
      tag.toLowerCase().indexOf(name.toLowerCase()) === 0);

    console.log(name, result);

    return result;
  }

  onSelected(event: MatAutocompleteSelectedEvent): void {
    this.tagsConditions.push({name: event.option.viewValue});
    this.tagsConditionsInput.nativeElement.value = '';
  }
}
