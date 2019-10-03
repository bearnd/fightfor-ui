import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import gql from 'graphql-tag';

import {
  DescriptorDefinitionInterface,
  DescriptorDefinitionSource,
  DescriptorInterface
} from '../../interfaces/descriptor.interface';
import {
  MeshDescriptorRetrieverService
} from '../../services/mesh-descriptor-retriever.service';
import { getDescriptorIconClass } from '../../utils/mesh-term.utils';


interface SourceNameUrlInterface {
  acronym: string;
  name: string;
  url: string;
}

interface DescriptorDefinitionBundle {
  sourceNameUrl: SourceNameUrlInterface;
  definition: DescriptorDefinitionInterface;
}


@Component({
  selector: 'app-mesh-term-dialog',
  templateUrl: './mesh-term-dialog.component.html',
  styleUrls: ['./mesh-term-dialog.component.scss']
})
export class MeshTermDialogComponent implements OnInit {

  // Descriptor definition sources defined in order of preference.
  definitionSources: SourceNameUrlInterface[] = [
    {
      acronym: 'MEDLINEPLUS',
      name: 'MedlinePlus Health Topics',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/MEDLINEPLUS'
    },
    {
      acronym: 'NCI_NCI_GLOSS',
      name: 'NCI Glossary',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/NCI_NCI-GLOSS/index.html'
    },
    {
      acronym: 'HPO',
      name: 'Human Phenotype Ontology',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/HPO',
    },
    {
      acronym: 'PSY',
      name: 'Psychological Index Terms',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/PSY',
    },
    {
      acronym: 'CHV',
      name: 'Consumer Health Vocabulary',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/CHV',
    },
    {
      acronym: 'NCI_NICHD',
      name: 'NICHD Terminology',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/NCI_NICHD',
    },
    {
      acronym: 'SPN',
      name: 'Standard Product Nomenclature',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/SPN',
    },
    {
      acronym: 'UMD',
      name: 'Universal Medical Device Nomenclature System',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/UMD',
    },
    {
      acronym: 'NCI_CDISC',
      name: 'CDISC Terminology',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/NCI_CDISC',
    },
    {
      acronym: 'MSH',
      name: 'MeSH',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/MSH',
    },
    {
      acronym: 'NCI',
      name: 'NCI Thesaurus',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/NCI',
    },
    {
      acronym: 'CSP',
      name: 'CRISP Thesaurus',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/CSP',
    },
    {
      acronym: 'PDQ',
      name: 'Physician Data Query',
      url: 'https://www.nlm.nih.gov' +
        '/research/umls/sourcereleasedocs/current/PDQ',
    }
  ];

  // GraphQL query used in the `getMeshDescriptorByUi` method.
  queryGetMeshDescriptorByUi = gql`
    query getMeshDescriptorByUi($ui: String!){
      descriptors {
        byUi(ui: $ui) {
          descriptorId,
          ui,
          name,
          treeNumbers {
            treeNumber
          }
          definitions {
            source,
            definition,
          },
          treeNumbers{
            treeNumber,
          },
          descriptorConcepts {
            isPreferred,
            concept {
              ui,
              scopeNote,
              name,
            }
          }
        }
      }
    }
  `;

  public descriptorUi: string = null;
  public descriptor: DescriptorInterface = null;
  public definitions: DescriptorDefinitionBundle[] = null;

  constructor(
    private dialogRef: MatDialogRef<MeshTermDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public meshDescriptorRetrieverService: MeshDescriptorRetrieverService,
    private router: Router,
  ) {
    // Retrieve the selected descriptor.
    this.descriptorUi = data.descriptor.ui;

    this.meshDescriptorRetrieverService.getMeshDescriptorByUi(
      this.descriptorUi,
      this.queryGetMeshDescriptorByUi,
    ).subscribe(
      (descriptor: DescriptorInterface) => {
        this.descriptor = descriptor;
        this.padDefinitions();
        this.definitions = this.getDefinitions();
      }
    );
  }

  ngOnInit() {}

  /**
   * Returns an object specifying the icon and name of the currently displayed
   * MeSH descriptor.
   */
  getIconClass() {
    return getDescriptorIconClass(this.descriptor.treeNumbers[0].treeNumber);
  }

  /**
   * Adds the descriptor's preferred concept's scope-note as a `MSH` definition
   * should a definition sourced under `MSH` is not already defined.
   */
  padDefinitions() {
    // Exit the function if a definition sourced under `MSH` is already defined
    // for this descriptor.
    if (this.descriptor.definitions.some(entry => entry.source === 'MSH')) {
      return;
    }

    // Find the `DescriptorConceptInterface` entry with an `isPreferred`
    // value of `true`. Exit the function if none could be found.
    const descriptorConceptPreferred = this.descriptor.descriptorConcepts.find(
entry => entry.isPreferred
    );
    if (!descriptorConceptPreferred) { return; }

    // Add a new definition to the descriptor based on that descriptor's
    // preferred concept's scope note.
    this.descriptor.definitions.push({
      source: DescriptorDefinitionSource.MSH,
      definition: descriptorConceptPreferred.concept.scopeNote
    });
  }

  /**
   * Extract the descriptor's definition in order of preferenace and compiles a
   * bundle of the definitions and their source descriptions.
   * @return The bundle of the definitions and their source descriptions in
   * order of preference.
   */
  getDefinitions(): DescriptorDefinitionBundle[] {

    const result: DescriptorDefinitionBundle[] = [];
    let sourceAcronymPreferred: string = null;

    // Iterate over the definition sources in their preferred order and add the
    // first matching descriptor definitions to the result bundle.
    for (const definitionSource of this.definitionSources) {
      for (const definitionDescriptor of this.descriptor.definitions) {
        if (definitionSource.acronym === definitionDescriptor.source) {
          result.push({
            sourceNameUrl: definitionSource,
            definition: definitionDescriptor,
          });
          sourceAcronymPreferred = definitionSource.acronym;
          break;
        }
      }
      if (result.length) {
        break;
      }
    }

    // Iterate over the definition sources in their preferred order and add any
    // matching descriptor definitions to the result bundle.
    for (const definitionSource of this.definitionSources) {
      // Skip the preferred source as its definition has already been added.
      if (definitionSource.acronym === sourceAcronymPreferred) {
          continue;
        }
      for (const definitionDescriptor of this.descriptor.definitions) {
        if (definitionSource.acronym === definitionDescriptor.source) {
          result.push({
            sourceNameUrl: definitionSource,
            definition: definitionDescriptor,
          });
          break;
        }
      }
    }

    return result;
  }

  /**
   * Concatenates a MeSH descriptor's definition by appending the name and link
   * to the definition source.
   * @param definition The definition to concatenate.
   * @return The concatenated definition.
   */
  concatenateDefinition(definition: DescriptorDefinitionBundle): string {
    return definition.definition.definition +
      ' (source: <a href="' +
      definition.sourceNameUrl.url +
      '">' +
      definition.sourceNameUrl.name +
      '</a>)';
  }

  /**
   * Redirects the user to the new-search page pre-populated with the current
   * MeSH descriptor as a search-term.
   */
  onNavigateToNewSearch() {
    const result = this.router.navigate(
      ['/app', 'searches', 'new'],
      {state: {descriptor: this.descriptor}}
    );
    result.then();

    // Close the dialog.
    this.dialogRef.close();
  }
}
