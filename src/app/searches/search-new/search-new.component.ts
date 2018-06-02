import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';
import { Subscription } from 'rxjs/Subscription';


import { TrialsManagerService } from '../../services/trials-manager.service';
import { MeshDescriptorFilterService } from '../../services/mesh-descriptor-filter.service';
import { MeshDescriptorInterface } from '../../interfaces/mesh-descriptor.interface';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit, OnDestroy {

  subscriptionSearch: Subscription;

  form: FormGroup;

  isSaved = false;

  descriptorsFilterConditionsService: MeshDescriptorFilterService;
  descriptorsFilterInterventionsService: MeshDescriptorFilterService;

  descriptorsConditionsFiltered: MeshDescriptorInterface[] = [];
  descriptorsInterventionsFiltered: MeshDescriptorInterface[] = [];

  separatorKeysCodes = [ENTER, COMMA, TAB];

  descriptorsConditionsAll: MeshDescriptorInterface[] = [
    {ui: '1', name: 'Bowel Cancer'},
    {ui: '2', name: 'Brain Cancer'},
    {ui: '3', name: 'Hepatic Carcinoma'},
    {ui: '4', name: 'Irritable Bowel Syndrome'},
    {ui: '5', name: 'Renal Carcinoma'},
    {ui: '6', name: 'Skin Cancer'},
    {ui: '7', name: 'Squamous Cell Carcinoma'},
    {ui: '8', name: 'Heart Diseases'},
  ];

  descriptorsInterventionsAll: MeshDescriptorInterface[] = [
    {ui: '1', name: 'Surgery'},
    {ui: '2', name: 'Chemotherapy'},
    {ui: '3', name: 'Radiotherapy'},
    {ui: '4', name: 'Immunotherapy'},
    {ui: '5', name: 'Hyperthermia'},
    {ui: '6', name: 'Focused Ultrasound Ablation'},
  ];

  constructor(private trialsManager: TrialsManagerService) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      conditions: new FormControl(null, [Validators.required]),
      interventions: new FormControl(null),
      years: new FormControl([10, 50]),
    });

    this.descriptorsFilterConditionsService = new MeshDescriptorFilterService(this.descriptorsConditionsAll);
    this.descriptorsFilterInterventionsService = new MeshDescriptorFilterService(this.descriptorsInterventionsAll);

    this.descriptorsConditionsFiltered = this.descriptorsConditionsAll;
    this.descriptorsInterventionsFiltered = this.descriptorsInterventionsAll;

    this.form.get('conditions').valueChanges.subscribe(
      (value => {
        // If the incoming value is of type `string` then perform a filtering
        // and update the `descriptorsConditionsFiltered` array.
        if (typeof value === 'string') {
          this.descriptorsConditionsFiltered = this.descriptorsFilterConditionsService.filterDescriptors(value, true);
        }
      })
    );

    this.form.get('interventions').valueChanges.subscribe(
      (value => {
        // If the incoming value is of type `string` then perform a filtering
        // and update the `descriptorsInterventionsFiltered` array.
        if (typeof value === 'string') {
          this.descriptorsInterventionsFiltered = this.descriptorsFilterInterventionsService.filterDescriptors(value, true);
        }
      })
    );
  }

  toggleSaved() {
    this.isSaved = !this.isSaved;
  }

  /**
   * Removes a descriptor from the selected condition descriptors.
   * @param {MeshDescriptorInterface} descriptor The descriptor to be removed.
   */
  onRemoveDescriptorCondition(descriptor: MeshDescriptorInterface): void {
    this.descriptorsFilterConditionsService.removeDescriptor(descriptor);
  }

  /**
   * Removes a descriptor from the selected intervention descriptors.
   * @param {TermInterface} descriptor The descriptor to be removed.
   */
  onRemoveDescriptorIntervention(descriptor: MeshDescriptorInterface): void {
    this.descriptorsFilterInterventionsService.removeDescriptor(descriptor);
  }

  /**
   * Adds a selected descriptor to the selected condition-descriptors.
   * @param {MatAutocompleteSelectedEvent} event The selection event.
   */
  onDescriptorConditionSelected(event: MatAutocompleteSelectedEvent): void {
    // Retrieve the selected descriptor.
    const descriptor = event.option.value;
    // Add the descriptor to the selected condition-descriptors.
    this.descriptorsFilterConditionsService.addDescriptor(descriptor);
    // Clear the form input's value.
    this.form.get('conditions').setValue('');
  }

  /**
   * Adds a selected descriptor to the selected intervention-descriptors.
   * @param {MatAutocompleteSelectedEvent} event The selection event.
   */
  onDescriptorInterventionSelected(event: MatAutocompleteSelectedEvent): void {
    // Retrieve the selected descriptor.
    const descriptor = event.option.value;
    // Add the descriptor to the selected intervention-descriptors.
    this.descriptorsFilterInterventionsService.addDescriptor(descriptor);
    // Clear the form input's value.
    this.form.get('interventions').setValue('');
  }

  onSubmit() {
    this.subscriptionSearch = this.trialsManager.searchTrials(
      ['Heart Diseases']
    ).subscribe(
      (response) => {
        console.log(response);
      }
    );
  }

  ngOnDestroy() {
    if (this.subscriptionSearch) {
      this.subscriptionSearch.unsubscribe();
    }
  }
}
