import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { ClinicalTrialStudyInterface } from './clinical-trial-study.interface';


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
export class TrialsManagerService {

  querySearchTrials = gql`
    query searchStudies(
      $meshTermsConditions: [String]!,
      $meshTermsInterventions: [String],
    ){
      searchStudies(
        meshTermsConditions: $meshTermsConditions,
        meshTermsInterventions: $meshTermsInterventions
      ) {
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
    meshTermsConditions: String[],
    meshTermsInterventions?: String[],
  ) {
    console.log('Performing search');

    return this.apollo.query<ResponseSearchTrials>({
      query: this.querySearchTrials,
      variables: {
        meshTermsConditions: meshTermsConditions,
        meshTermsInterventions: meshTermsInterventions,
      }
    }).map((response) => {
      console.log(response);
      return response.data.searchStudies;
    });
  }
}
