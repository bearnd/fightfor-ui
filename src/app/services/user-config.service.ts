import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { cloneDeep } from 'lodash';
import { ApolloQueryResult } from 'apollo-client';
import { GraphQLError } from 'graphql';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import {
  UserInterface,
  SearchInterface,
} from '../interfaces/user-config.interface';
import { Auth0UserProfileInterface } from './auth.service';
import { DescriptorInterface } from '../interfaces/descriptor.interface';
import { StudyInterface } from '../interfaces/study.interface';
import { getUserId } from '../shared/utils';


interface VariablesGetUser {
  auth0UserId: string;
}

interface VariablesUpsertUser {
  auth0UserId: string;
  email: string;
}

interface VariablesUpsertSearch {
  auth0UserId: string;
  searchUuid: string;
  title: string;
  gender: string;
  yearBeg: number;
  yearEnd: number;
  ageBeg: number;
  ageEnd: number;
  meshDescriptorIds: number[];
}

interface VariablesDeleteSearch {
  auth0UserId: string;
  searchUuid: string;
}

interface VariablesUpsertDeleteUserStudy {
  auth0UserId: string;
  nctId: string;
}

interface ResponseGetUser {
  users: {
    byAuth0Id: UserInterface;
  };
}

interface ResponseUpsertUser {
  upsertUser: {
    user: UserInterface;
  };
}

interface ResponseUpsertSearch {
  upsertSearch: {
    search: SearchInterface;
  };
}

interface ResponseDeleteSearch {
  deleteSearch: {
    search: SearchInterface;
  };
}

interface ResponseUpsertUserStudy {
  upsertUserStudy: {
    user: UserInterface;
  };
}

interface ResponseDeleteUserStudy {
  deleteUserStudy: {
    user: UserInterface;
  };
}


@Injectable()
export class UserConfigService {

  // Private subject and public observable to indicate when a user is loading.
  private loadingUser: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  public isLoadingUser: Observable<boolean> = this.loadingUser.asObservable();

  // Private subject and public observable to indicate when a user's saved
  // studies are updating.
  private updatingUserStudies: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  public isUpdatingUserStudies: Observable<boolean>
    = this.updatingUserStudies.asObservable();

  // Behavior subject to indicate when a new search is being created.
  public creatingNewSearch: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);

  // Private subject and public observable to update observers on the latest
  // user searches.
  public searchesLatest: Subject<SearchInterface[]>
    = new Subject<SearchInterface[]>();

  // The stored user configuration.
  public userConfig: UserInterface = null;

  // Array of user-searches.
  public userSearches: SearchInterface[] = [];
  // Array of user-studies.
  public userStudies: StudyInterface[] = [];

  queryGetUser = gql`
    query getUser(
      $auth0UserId: String!
    ) {
      users {
        byAuth0Id(auth0UserId: $auth0UserId) {
          userId,
          auth0UserId,
          email,
          searches {
            searchId,
            searchUuid,
            title,
            gender,
            yearBeg,
            yearEnd,
            ageBeg,
            ageEnd,
            descriptors {
              descriptorId,
              ui,
              name,
            },
          },
          studies {
            studyId,
            nctId,
          },
        }
      }
    }
  `;

  mutationUpsertUser = gql`
    mutation upsertUser(
      $auth0UserId: String!,
      $email: String!,
    ) {
      upsertUser(user: {
        auth0UserId: $auth0UserId,
        email: $email,
      }) {
        user {
          userId,
          auth0UserId,
          email,
        }
      }
    }
  `;

  mutationUpsertSearch = gql`
    mutation upsertSearch(
      $auth0UserId: String!,
      $searchUuid: UUID!,
      $title: String!,
      $gender: GenderType,
      $yearBeg: Int,
      $yearEnd: Int,
      $ageBeg: Int,
      $ageEnd: Int,
      $meshDescriptorIds: [Int]!,
    ) {
      upsertSearch(
        auth0UserId: $auth0UserId,
        search: {
          searchUuid: $searchUuid,
          title: $title,
          gender: $gender,
          yearBeg: $yearBeg,
          yearEnd: $yearEnd,
          ageBeg: $ageBeg,
          ageEnd: $ageEnd,
        },
        meshDescriptorIds: $meshDescriptorIds,
      ) {
        search {
          searchId,
          searchUuid,
          title,
          gender,
          yearBeg,
          yearEnd,
          ageBeg,
          ageEnd,
          descriptors {
            descriptorId,
            ui,
            name,
          },
        }
      }
    }
  `;

  mutationDeleteSearch = gql`
    mutation deleteSearch(
      $auth0UserId: String!,
      $searchUuid: UUID!,
    ) {
      deleteSearch(
        auth0UserId: $auth0UserId,
        searchUuid: $searchUuid,
      ) {
        search {
          searchId,
          searchUuid,
          title,
          gender,
          yearBeg,
          yearEnd,
          ageBeg,
          ageEnd,
          descriptors {
            descriptorId,
            ui,
            name,
          },
        }
      }
    }
  `;

  mutationUpsertUserStudy = gql`
    mutation upsertUserStudy(
      $auth0UserId: String!,
      $nctId: String!,
    ) {
      upsertUserStudy(userStudy: {
        auth0UserId: $auth0UserId,
        nctId: $nctId,
      }) {
        user {
          studies {
            studyId,
            nctId,
          }
        }
      }
    }
  `;

  mutationDeleteUserStudy = gql`
    mutation deleteUserStudy(
      $auth0UserId: String!,
      $nctId: String!,
    ) {
      deleteUserStudy(userStudy: {
        auth0UserId: $auth0UserId,
        nctId: $nctId,
      }) {
        user {
          studies {
            studyId,
            nctId,
          }
        }
      }
    }
  `;

  constructor(private apollo: Apollo) {}

  /**
   * Deep-copies a search object and adds property placeholders populated when
   * the search is performed. This is needed cause search objects coming off
   * Apollo are immutable.
   * @param search The search to be copied.
   */
  cloneSearch(search: SearchInterface) {

    // Deep-copy the search object.
    const searchClone: SearchInterface = cloneDeep(search);

    // Add placeholder properties.
    searchClone.studies = [];
    searchClone.citations = [];
    searchClone.studiesStats = {};
    searchClone.citationsStats = {};

    return searchClone;
  }

  /**
   * Deep-copies an array of searches into `this.userSearches` using the
   * `cloneSearch` method and updates the `this.searchesLatest` subject.
   * @param searches The array of searches to deep-copy.
   */
  copySearches(searches: SearchInterface[]) {

    // Reset the `this.userSearches` array.
    this.userSearches = [];

    // Iterate over the input array, and clone each search, pushing it into the
    // `this.userSearches` array.
    if (searches) {
      for (const search of searches) {
        this.userSearches.push(this.cloneSearch(search));
      }
    }

    // Update the subject.
    this.searchesLatest.next(this.userSearches);
  }

  /**
   * Updates the local copy of the user configuration.
   * @param userConfig The user configuration to copy.
   */
  updateUserConfig(userConfig: UserInterface) {
    this.userConfig = userConfig;

    this.copySearches(this.userConfig.searches);

    this.updatingUserStudies.next(true);
    this.userStudies = cloneDeep(this.userConfig.studies);
    this.updatingUserStudies.next(false);
  }

  /**
   * Retrieve a user-search through its UUID.
   * @param searchUuid The UUID of the search to be retrieved.
   * @returns The retrieved search or null if no search matching the given UUID
   * was found.
   */
  getUserSearch(searchUuid: string): SearchInterface | null {
    if (!this.userSearches) {
      return null;
    }

    for (const search of this.userSearches) {
      if (search.searchUuid === searchUuid) {
        return search;
      }
    }
    return null;
  }

  /**
   * Retrieve a user-study through its NCT ID.
   * @param nctId The NCT ID of the study to retrieve.
   * @returns The retrieved study or null if no study matching the given NCT
   * ID was found.
   */
  getUserStudy(nctId: string): StudyInterface | null {
    if (!this.userStudies) {
      return null;
    }

    for (const study of this.userStudies) {
      if (study.nctId === nctId) {
        return study;
      }
    }
    return null;
  }

  /**
   * Retrieve the DB user for the current Auth0 user. If a DB user does not
   * exist a new one is created.
   * @param userProfile The Auth0 user-profile for which a DB will be retrieved.
   */
  getUserConfig(userProfile: Auth0UserProfileInterface) {

    // Update the 'loading' subject to indicate that loading is in progress.
    this.loadingUser.next(true);

    // Retrieve the user ID.
    const auth0UserId = getUserId(userProfile);

    // Retrieve the DB user for the current Auth0 user. If the user exists then
    // set its configuration under `this.userConfig` and deep-copy the user's
    // searches updating the corresponding subjects. If the user does not exist
    // then upsert the user and copy the configuration and searches.
    this.apollo.watchQuery<ResponseGetUser, VariablesGetUser>({
      query: this.queryGetUser,
      variables: {
        auth0UserId: auth0UserId
      }
    }).valueChanges.subscribe(
      (response: ApolloQueryResult<ResponseGetUser>) => {
        this.updateUserConfig(response.data.users.byAuth0Id);
        this.loadingUser.next(false);
      },
      (error: GraphQLError) => {
        if (error.message.includes('could not be found')) {
          this.apollo.mutate<ResponseUpsertUser, VariablesUpsertUser>({
            mutation: this.mutationUpsertUser,
            variables: {
              auth0UserId: auth0UserId,
              email: userProfile.email,
            }
          }).subscribe(
            (response: ApolloQueryResult<ResponseUpsertUser>) => {
              this.updateUserConfig(response.data.upsertUser.user);
              this.loadingUser.next(false);
            }
          );
        }
      }
    );
  }

  /**
   * Create a new search updating the `this.userSearches` and the
   * `creatingNewSearch` subject.
   * @param userProfile The Auth0 profile for the user under which the search
   * will be created.
   * @param searchUuid The UUID of the new search.
   * @param title The title of the new search.
   * @param gender The patient gender studies will be limited to for this
   * search.
   * @param yearBeg The beginning of the year-range studies will be limited to
   * for this search.
   * @param yearEnd The end of the year-range studies will be limited to for
   * this search.
   * @param ageBeg The beginning of the eligibility age-range studies will be
   * limited to for this search.
   * @param ageEnd The end of the eligibility age-range studies will be limited
   * to for this search.
   * @param descriptors The MeSH descriptors selected for this search.
   */
  upsertSearch(
    userProfile: Auth0UserProfileInterface,
    searchUuid: string,
    title: string,
    gender: string,
    yearBeg: number,
    yearEnd: number,
    ageBeg: number,
    ageEnd: number,
    descriptors: DescriptorInterface[],
  ) {

    // Update the 'loading' subject to indicate that creating a new search is
    // in progress.
    this.creatingNewSearch.next(true);

    // Retrieve the user ID.
    const auth0UserId = getUserId(userProfile);

    // Retrieve the IDs out of the provided MeSH descriptors.
    const descriptorIds: number[] = descriptors.map(
      function (d) {
        return d.descriptorId;
      }
    );

    // Upsert the search and copy the result into `this.userSearches` updating
    // the subject.
    this.apollo.mutate<ResponseUpsertSearch, VariablesUpsertSearch>({
      mutation: this.mutationUpsertSearch,
      variables: {
        auth0UserId: auth0UserId,
        searchUuid: searchUuid,
        title: title,
        gender: gender,
        yearBeg: yearBeg,
        yearEnd: yearEnd,
        ageBeg: ageBeg,
        ageEnd: ageEnd,
        meshDescriptorIds: descriptorIds,
      },
      refetchQueries: [{
        query: this.queryGetUser,
        variables: {auth0UserId: auth0UserId},
      }]
    }).subscribe();
  }

  /**
   * Deletes a search through its UUID.
   * @param userProfile The profile of the user for which the search deletion
   * will be performed.
   * @param searchUuid The UUID of the search to be deleted.
   */
  deleteSearch(
    userProfile: Auth0UserProfileInterface,
    searchUuid: string,
  ): void {

    // Exit the method if no matching search can be found for the given UUID.
    if (!this.getUserSearch(searchUuid)) {
      return;
    }

    // Retrieve the user ID.
    const auth0UserId = getUserId(userProfile);

    // Delete the defined search in the database and repeat the `queryGetUser`
    // query to update the entire user configuration.
    this.apollo.mutate<ResponseDeleteSearch, VariablesDeleteSearch>({
        mutation: this.mutationDeleteSearch,
        variables: {
          auth0UserId: auth0UserId,
          searchUuid: searchUuid,
        },
        refetchQueries: [{
          query: this.queryGetUser,
          variables: {auth0UserId: auth0UserId},
        }]
      }
    ).subscribe();
  }

  /**
   * Adds a clinical-trials study as followed under the user configuration.
   * @param userProfile The profile of the user to add the study to.
   * @param nctId The NCT ID of the clinical-trial study to add.
   */
  followStudy(userProfile: Auth0UserProfileInterface, nctId: string) {
    // Retrieve the user ID.
    const auth0UserId = getUserId(userProfile);

    // If the given study is already followed by the user the return.
    if (this.getUserStudy(nctId)) {
      return null;
    }

    this.updatingUserStudies.next(true);

    // Add the defined user study in the database and repeat the `queryGetUser`
    // query to update the entire user configuration.
    this.apollo.mutate<
      ResponseUpsertUserStudy,
      VariablesUpsertDeleteUserStudy
      >({
        mutation: this.mutationUpsertUserStudy,
        variables: {
          auth0UserId: auth0UserId,
          nctId: nctId,
        },
        refetchQueries: [{
          query: this.queryGetUser,
          variables: {auth0UserId: auth0UserId},
        }]
      }
    ).subscribe();
  }

  /**
   * Removes a clinical-trials study as followed from the user configuration.
   * @param userProfile The profile of the user to remove the study from.
   * @param nctId The NCT ID of the clinical-trial study to remove.
   */
  unfollowStudy(userProfile: Auth0UserProfileInterface, nctId: string) {
    // Retrieve the user ID.
    const auth0UserId = getUserId(userProfile);

    // If the given study is not already followed by the user the return.
    if (!this.getUserStudy(nctId)) {
      return null;
    }

    this.updatingUserStudies.next(true);

    // Delete the defined user study in the database and repeat the
    // `queryGetUser` query to update the entire user configuration.
    this.apollo.mutate<
      ResponseDeleteUserStudy,
      VariablesUpsertDeleteUserStudy
      >({
        mutation: this.mutationDeleteUserStudy,
        variables: {
          auth0UserId: auth0UserId,
          nctId: nctId,
        },
        refetchQueries: [{
          query: this.queryGetUser,
          variables: {auth0UserId: auth0UserId},
        }]
      }
    ).subscribe();
  }
}
