import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { StudyInterface } from '../interfaces/study.interface';
import { MeshDescriptorInterface } from '../interfaces/mesh-descriptor.interface';


interface VariablesSearchStudies {
  meshDescriptorIds: number[]
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

  private loadingSearchStudies = new BehaviorSubject<boolean>(false);
  private loadingGetStudyByNctId = new BehaviorSubject<boolean>(false);
  private loadingFilterStudies = new BehaviorSubject<boolean>(false);
  private loadingCountStudies = new BehaviorSubject<boolean>(false);

  public isLoadingSearchStudies = this.loadingSearchStudies.asObservable();
  public isLoadingGetStudyByNctId = this.loadingGetStudyByNctId.asObservable();
  public isLoadingFilterStudies = this.loadingFilterStudies.asObservable();
  public isLoadingCountStudies = this.loadingCountStudies.asObservable();

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

  /**
   * Retrieve a clinical-trials study through its NCT ID.
   * @param {string} nctId The NCT ID of the study to be retrieved.
   */
  getTrialByNctId(nctId: string) {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingGetStudyByNctId.next(true);

    return this.apollo
      .query<ResponseGetStudyByNctId, VariablesGetStudyByNctId>({
        query: this.queryGetStudyByNctId,
        variables: {
          nctId: nctId
        }
      }).map((response) => {
        // Update the 'loading' observable to indicate that loading is complete.
        this.loadingGetStudyByNctId.next(false);
        return response.data.getStudyByNctId;
      });
  }

  /**
   * Search for clinical-trial studies based on an array of MeSH descriptors
   * studies are associated with.
   * @param {MeshDescriptorInterface[]} descriptors Array of MeSH descriptors
   * for which the search is performed
   */
  searchStudies(
    descriptors: MeshDescriptorInterface[],
  ) {
    // Update the 'loading' observable to indicate that loading is in progress.
    this.loadingSearchStudies.next(true);

    // Retrieve the IDs out of the provided MeSH descriptors.
    const descriptorIds: number[] = descriptors.map(
      function (d) {
        return d.descriptorId;
      }
    );

    return this.apollo
      .query<ResponseSearchStudies, VariablesSearchStudies>({
        query: this.querySearchStudies,
        variables: {
          meshDescriptorIds: descriptorIds,
        }
      }).map((response) => {
        // Update the 'loading' observable to indicate that loading is complete.
        this.loadingSearchStudies.next(false);
        return response.data.studies.search;
      });
  }
      }
    }).map((response) => {
      return response.data.studies.search;
    });
  }

}
