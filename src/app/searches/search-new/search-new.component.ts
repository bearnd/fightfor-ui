import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER, TAB } from '@angular/cdk/keycodes';
import { Subscription } from 'rxjs/Subscription';

import { TrialsManagerService } from '../../services/trials-manager.service';
import { MeshDescriptorFilterService } from '../../services/mesh-descriptor-filter.service';
import { MeshDescriptorInterface } from '../../interfaces/mesh-descriptor.interface';
import { MeshDescriptorRetrieverService } from '../../services/mesh-descriptor-retriever.service';


@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit, OnDestroy {

  loadingDescriptorsConditions = true;
  loadingDescriptorsInterventions = true;

  subscriptionSearch: Subscription;
  subscriptionMeshDescriptorConditionsRetrieval: Subscription;
  subscriptionMeshDescriptorInterventionsRetrieval: Subscription;

  form: FormGroup;

  isSaved = false;

  descriptorsFilterConditionsService: MeshDescriptorFilterService;
  descriptorsFilterInterventionsService: MeshDescriptorFilterService;

  descriptorsConditionsAll: MeshDescriptorInterface[] = [];
  descriptorsInterventionsAll: MeshDescriptorInterface[] = [];
  descriptorsConditionsFiltered: MeshDescriptorInterface[] = [];
  descriptorsInterventionsFiltered: MeshDescriptorInterface[] = [];

  separatorKeysCodes = [ENTER, COMMA, TAB];

  constructor(
    private trialsManager: TrialsManagerService,
    private meshDescriptorRetriever: MeshDescriptorRetrieverService,
  ) {
  }

  ngOnInit() {

    this.fetchDescriptors();

    this.form = new FormGroup({
      conditions: new FormControl(null, [Validators.required]),
      interventions: new FormControl(null),
    });

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

  isLoading() {
    return this.loadingDescriptorsConditions || this.loadingDescriptorsInterventions;
  }

  fetchDescriptors() {

    this.subscriptionMeshDescriptorConditionsRetrieval = this.meshDescriptorRetriever
      .getMeshDescriptorsByTreeNumberPrefix('C04')
      .subscribe(
        (response: MeshDescriptorInterface[]) => {
          this.descriptorsConditionsAll = response;
          this.descriptorsFilterConditionsService = new MeshDescriptorFilterService(this.descriptorsConditionsAll);
          this.descriptorsConditionsFiltered = this.descriptorsConditionsAll;
          this.loadingDescriptorsConditions = false;
        },
        (error: any) => {
          console.log(error);
          this.loadingDescriptorsConditions = false;
        },
        () => {
          this.loadingDescriptorsConditions = false;
        }
      );

    this.subscriptionMeshDescriptorInterventionsRetrieval = this.meshDescriptorRetriever
      .getMeshDescriptorsByTreeNumberPrefix('D12')
      .subscribe(
        (response: MeshDescriptorInterface[]) => {
          this.descriptorsInterventionsAll = response;
          this.descriptorsFilterInterventionsService = new MeshDescriptorFilterService(this.descriptorsInterventionsAll);
          this.descriptorsInterventionsFiltered = this.descriptorsInterventionsAll;
          this.loadingDescriptorsInterventions = false;
        },
        (error: any) => {
          console.log(error);
          this.loadingDescriptorsInterventions = false;
        },
        () => {
          this.loadingDescriptorsInterventions = false;
        }
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
   * @param {MeshDescriptorInterface} descriptor The descriptor to be removed.
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
      this.subscriptionMeshDescriptorConditionsRetrieval.unsubscribe();
      this.subscriptionMeshDescriptorInterventionsRetrieval.unsubscribe();
    }
  }
}
