import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

import { StudyInterface } from '../interfaces/study.interface';
import { MeshDescriptorInterface } from '../interfaces/mesh-descriptor.interface';


interface VariablesSearchStudies {
  meshDescriptorIds: Number[]
}

interface ResponseSearchStudies {
  studies: {
    search: StudyInterface[]
  }
}

interface ResponseGetStudyByNctId {
  getStudyByNctId: StudyInterface
}

interface VariablesGetStudyByNctId {
  nctId: string
}

@Injectable()
export class StudyRetrieverService {

  querySearchStudies = gql`
    query searchStudies($meshDescriptorIds: [Int]!) {
      studies {
        search(
          meshDescriptorIds: $meshDescriptorIds,
          doIncludeChildren: true,
        ) {
          studyId,
          nctId
        }
      }
    }
  `;

  queryGetStudyByNctId = gql`
    query($nctId: String!) {
       getStudyByNctId(nctId: $nctId) {
        studyId,
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

  searchStudies(
    descriptors: MeshDescriptorInterface[],
  ) {

    // Retrieve the IDs out of the provided MeSH descriptors.
    const descriptorIds: Number[] = descriptors.map(
      function (d) {
        return d.descriptorId;
      }
    );

    return this.apollo.query<ResponseSearchStudies, VariablesSearchStudies>({
      query: this.querySearchStudies,
      variables: {
        meshDescriptorIds: descriptorIds,
      }
    }).map((response) => {
      return response.data.studies.search;
    });
  }

}
