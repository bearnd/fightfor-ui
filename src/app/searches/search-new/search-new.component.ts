import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';
import { Subscription } from 'rxjs/Subscription';
import { debounceTime } from 'rxjs/operators/debounceTime';

import { ClinicalTrialsStudiesRetrieverService } from '../../services/clinical-trials-studies-retriever.service';
import { MeshDescriptorInterface } from '../../interfaces/mesh-descriptor.interface';
import { MeshDescriptorRetrieverService } from '../../services/mesh-descriptor-retriever.service';
import { ClinicalTrialsStudiesStatsRetrieverService } from '../../services/clinical-trials-studies-stats-retriever.service';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit, OnDestroy {

  subscriptionSearch: Subscription;
  subscriptionMeshDescriptorRetrieval: Subscription;

  form: FormGroup;

  isSaved = false;

  descriptorsAll: MeshDescriptorInterface[] = [];
  descriptorsSelected: MeshDescriptorInterface[] = [];

  separatorKeysCodes = [ENTER, COMMA, TAB];

  constructor(
    private trialsManager: ClinicalTrialsStudiesRetrieverService,
    private meshDescriptorRetriever: MeshDescriptorRetrieverService,
    private studiesStatsRetriever: ClinicalTrialsStudiesStatsRetrieverService
  ) {
  }

  ngOnInit() {

    this.form = new FormGroup({
      descriptors: new FormControl(null, [Validators.required]),
    });

    // Subscribe to the `valueChanges` observable of the input control and perform a synonym-search for matching MeSH descriptors with a
    // 250ms debounce so that we don't perform a search for every keystroke.
    this.form.get('descriptors').valueChanges.pipe(debounceTime(400)).subscribe(
      (value) => {
        // If the incoming value is of type `string` then perform a synonym search through the `meshDescriptorRetriever` service and update
        // `descriptorsAll` with the results.
        if (typeof value === 'string') {
          this.meshDescriptorRetriever.getMeshDescriptorsBySynonym(value, 10)
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
    this.subscriptionSearch = this.studiesStatsRetriever
      .countStudiesByOverallStatus()
      .subscribe(
      (response) => {
        console.log(response);
      }
    );
  }

  ngOnDestroy() {
    if (this.subscriptionSearch) {
      this.subscriptionSearch.unsubscribe();
      this.subscriptionMeshDescriptorRetrieval.unsubscribe();
    }
  }
}
