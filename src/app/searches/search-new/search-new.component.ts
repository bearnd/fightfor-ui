import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';
import { debounceTime } from 'rxjs/operators/debounceTime';

import { MeshDescriptorInterface } from '../../interfaces/mesh-descriptor.interface';
import { MeshDescriptorRetrieverService } from '../../services/mesh-descriptor-retriever.service';
import { SearchesService } from '../../services/searches.service';
import { SearchInterface } from '../../interfaces/search.interface';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit, OnDestroy {

  subscriptionDescriptors: Subscription;

  form: FormGroup;

  isSaved = false;

  descriptorsAll: MeshDescriptorInterface[] = [];
  descriptorsSelected: MeshDescriptorInterface[] = [];

  separatorKeysCodes = [ENTER, COMMA, TAB];

  constructor(
    private meshDescriptorRetriever: MeshDescriptorRetrieverService,
    private searches: SearchesService,
    private router: Router,
  ) {
  }

  ngOnInit() {

    this.form = new FormGroup({
      descriptors: new FormControl(
        null,
        [Validators.required]
      ),
    });

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
  }

  isLoading() {
    return false;
  }

  toggleSaved() {
    this.isSaved = !this.isSaved;
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
    this.form.get('descriptors').setValue('');
  }

  onSubmit() {
    // Create a new search with the selected descriptors.
    const search: SearchInterface = this.searches.createSearch(
      this.descriptorsSelected
    );

    // Navigate to the `SearchResultsComponent` with the new search.
    this.router.navigate(['/searches', search.searchUuid]);
  }

  ngOnDestroy() {
    if (this.subscriptionDescriptors) {
      this.subscriptionDescriptors.unsubscribe();
    }
  }
}
