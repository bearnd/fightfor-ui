import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { ClinicalTrialStudyInterface } from '../interfaces/clinical-trial-study.interface';
import { MeshDescriptorInterface } from '../interfaces/mesh-descriptor.interface';




interface ResponseSearchTrials {
  searchStudies: ClinicalTrialStudyInterface
}

interface ResponseGetStudyByNctId {
  getStudyByNctId: ClinicalTrialStudyInterface
}

interface VariablesGetStudyByNctId {
  nctId: string
}

@Injectable()
export class ClinicalTrialsStudiesRetrieverService {

  querySearchTrials = gql`
    query searchStudies(
      $meshDescriptorNames: [String]!,
    ){
      searchStudies(meshDescriptors: $meshDescriptorNames) {
        nctId,
        source
      }
    }
  `;

  queryGetStudyByNctId = gql`
    query($nctId: String!) {
       getStudyByNctId(nctId: $nctId) {
        nctId
      }
    }
  `;

  constructor(private apollo: Apollo) {
  }

  getTrialByNctId(nctId: string) {
    return this.apollo.query<ResponseGetStudyByNctId, VariablesGetStudyByNctId>({
      query: this.queryGetStudyByNctId,
      variables: {
        nctId: nctId
      }
    }).map((response) => {
      return response.data.getStudyByNctId;
    });
  }

  searchTrials(
    meshDescriptorsConditions: MeshDescriptorInterface[],
    meshDescriptorsInterventions?: MeshDescriptorInterface[],
  ) {

    const meshDescriptorsConditionNames: String[] = meshDescriptorsConditions.map(function (d) { return d.name });
    const meshDescriptorsInterventionNames: String[] = meshDescriptorsInterventions.map(function (d) { return d.name });

    return this.apollo.query<ResponseSearchTrials>({
      query: this.querySearchTrials,
      variables: {
        meshTermsConditions: meshDescriptorsConditionNames,
        meshTermsInterventions: meshDescriptorsInterventionNames,
      }
    }).map((response) => {
      console.log(response);
      return response.data.searchStudies;
    });
  }
}
