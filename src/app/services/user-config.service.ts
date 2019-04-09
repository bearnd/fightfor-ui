import { Injectable } from '@angular/core';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { cloneDeep } from 'lodash';

import { ApolloQueryResult } from 'apollo-client';
import { GraphQLError } from 'graphql';
import { Observable, Subject } from 'rxjs/Rx';

import {
  UserInterface,
  SearchInterface,
} from '../interfaces/user-config.interface';
import { Auth0UserProfileInterface } from './auth.service';
import { DescriptorInterface } from '../interfaces/descriptor.interface';
import { StudyInterface } from '../interfaces/study.interface';


interface VariablesGetUser {
  auth0UserId: string
}

interface VariablesUpsertUser {
  auth0UserId: string
  email: string
}

interface VariablesUpsertSearch {
  auth0UserId: string
  searchUuid: string
  title: string
  gender: string
  yearBeg: number
  yearEnd: number
  ageBeg: number
  ageEnd: number
  meshDescriptorIds: number[]
}

interface VariablesDeleteSearch {
  auth0UserId: string
  searchUuid: string
}

interface VariablesUpsertDeleteUserStudy {
  auth0UserId: string
  nctId: string
}

interface ResponseGetUser {
  users: {
    byAuth0Id: UserInterface
  }
}

interface ResponseUpsertUser {
  upsertUser: {
    user: UserInterface
  }
}

interface ResponseUpsertSearch {
  upsertSearch: {
    search: SearchInterface
  }
}

interface ResponseDeleteSearch {
  deleteSearch: {
    search: SearchInterface
  }
}

interface ResponseUpsertUserStudy {
  upsertUserStudy: {
    user: UserInterface
  }
}

interface ResponseDeleteUserStudy {
  deleteUserStudy: {
    user: UserInterface
  }
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

  // Private subject and public observable to indicate when a new search is
  // being created.
  private creatingNewSearch: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  public isCreatingNewSearch: Observable<boolean>
    = this.creatingNewSearch.asObservable();

  // Private subject and public observable to update observers on the latest
  // user searches.
  private subSearchesLatest: Subject<SearchInterface[]>
    = new Subject<SearchInterface[]>();
  public searchesLatest: Observable<SearchInterface[]>
    = this.subSearchesLatest.asObservable();

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
   * @param {SearchInterface} search The search to be copied.
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
   * `cloneSearch` method and updates the `this.subSearchesLatest` subject.
   * @param {SearchInterface[]} searches The array of searches to deep-copy.
   */
  copySearches(searches: SearchInterface[]) {

    // Reset the `this.userSearches` array.
    this.userSearches = [];

    // Iterate over the input array, and clone each search, pushing it into the
    // `this.userSearches` array.
    for (const search of searches) {
      this.userSearches.push(this.cloneSearch(search));
    }

    // Update the subject.
    this.subSearchesLatest.next(this.userSearches);
  }

  /**
   * Retrieve the DB user for the current Auth0 user. If a DB user does not
   * exist a new one is created.
   * @param {Auth0UserProfileInterface} userProfile The Auth0 user-profile for
   * which a DB will be retrieved.
   */
  getUserConfig(userProfile: Auth0UserProfileInterface) {

    // Update the 'loading' subject to indicate that loading is in progress.
    this.loadingUser.next(true);

    // Retrieve the user ID by removing the `auth0|` prefix from the Auth0
    // user ID.
    const auth0UserId = userProfile.sub
      .replace('auth0|', '');

    // Retrieve the DB user for the current Auth0 user. If the user exists then
    // set its configuration under `this.userConfig` and deep-copy the user's
    // searches updating the corresponding subjects. If the user does not exist
    // then upsert the user and copy the configuration and searches.
    this.apollo.query<ResponseGetUser, VariablesGetUser>({
      query: this.queryGetUser,
      variables: {
        auth0UserId: auth0UserId
      }
    }).subscribe(
      (response: ApolloQueryResult<ResponseGetUser>) => {
        this.userConfig = response.data.users.byAuth0Id;
        this.copySearches(this.userConfig.searches);
        this.userStudies = cloneDeep(this.userConfig.studies);
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
              this.userConfig = response.data.upsertUser.user;
              this.copySearches(this.userConfig.searches);
              this.userStudies = cloneDeep(this.userConfig.studies);
              this.loadingUser.next(false);
            }
          )
        }
      }
    );
  }

  /**
   * Create a new search updating the `this.userSearches` and the
   * `creatingNewSearch` subject.
   * @param {Auth0UserProfileInterface} userProfile The Auth0 profile for the
   * user under which the search will be created.
   * @param {string} searchUuid The UUID of the new search.
   * @param {string} title The title of the new search.
   * @param {string} gender The patient gender studies will be limited to for
   * this search.
   * @param {number} yearBeg The beginning of the year-range studies will be
   * limited to for this search.
   * @param {number} yearEnd The end of the year-range studies will be limited
   * to for this search.
   * @param {number} ageBeg The beginning of the eligibility age-range studies
   * will be limited to for this search.
   * @param {number} ageEnd The end of the eligibility age-range studies will
   * be limited to for this search.
   * @param {DescriptorInterface[]} descriptors The MeSH descriptors
   * selected for this search.
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

    // Retrieve the user ID by removing the `auth0|` prefix from the Auth0
    // user ID.
    const auth0UserId = userProfile.sub
      .replace('auth0|', '');

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
      }
    }).subscribe(
      (response: ApolloQueryResult<ResponseUpsertSearch>) => {
        this.userSearches.push(
          this.cloneSearch(response.data.upsertSearch.search)
        );
        this.creatingNewSearch.next(false);
      }
    )

  }

  /**
   * Deletes a search through its UUID.
   * @param {Auth0UserProfileInterface} userProfile The profile of the user for
   * which the search deletion will be performed.
   * @param {string} searchUuid The UUID of the search to be deleted.
   */
  deleteSearch(
    userProfile: Auth0UserProfileInterface,
    searchUuid: string,
  ): void {

    // Exit the method if no matching search can be found for the given UUID.
    if (!this.getUserSearch(searchUuid)) {
      return;
    }

    // Retrieve the user ID by removing the `auth0|` prefix from the Auth0
    // user ID.
    const auth0UserId = userProfile.sub
      .replace('auth0|', '');

    // Delete the defined search in the database and remove it from
    // `this.userSearches` and update the corresponding subject.
    this.apollo.mutate<ResponseDeleteSearch, VariablesDeleteSearch>({
        mutation: this.mutationDeleteSearch,
        variables: {
          auth0UserId: auth0UserId,
          searchUuid: searchUuid,
        }
      }
    ).subscribe(
      (response: ApolloQueryResult<ResponseDeleteSearch>) => {
        // Retrieve the search out of the deletion response.
        const search: SearchInterface =
          this.cloneSearch(response.data.deleteSearch.search);

        // Find the index of the given search and delete it off
        // `this.userSearches`.
        const idxSearch = this.userSearches.indexOf(search);
        this.userSearches.splice(idxSearch, 1);

        // Update the subject.
        this.subSearchesLatest.next(this.userSearches);
      }
    )
  }

  /**
   * Retrieve a user-search through its UUID.
   * @param {string} searchUuid The UUID of the search to be retrieved.
   * @returns {SearchInterface | null} The retrieved search or null if no search
   * matching the given UUID was found.
   */
  getUserSearch(searchUuid: string): SearchInterface | null {

    // Iterate over the user searches and return the one matching the provided
    // UUID or null if no matching search is found.
    for (const search of this.userSearches) {
      if (search.searchUuid === searchUuid) {
        return search;
      }
    }
    return null;
  }

  getUserStudy(nctId: string): StudyInterface | null {
    // Iterate over the user studies and return the one matching the provided
    // NCT ID or null if no matching search is found.
    for (const study of this.userStudies) {
      if (study.nctId === nctId) {
        return study;
      }
    }
    return null;
  }

  followStudy(userProfile: Auth0UserProfileInterface, nctId: string) {
    // Retrieve the user ID by removing the `auth0|` prefix from the Auth0
    // user ID.
    const auth0UserId = userProfile.sub
      .replace('auth0|', '');

    // If the given study is already followed by the user the return.
    if (this.getUserStudy(nctId)) {
      return null;
    }

    this.updatingUserStudies.next(true);

    // Add the defined user study in the database and add it to the
    // `this.userStudies` and update the corresponding subject.
    this.apollo.mutate<
      ResponseUpsertUserStudy,
      VariablesUpsertDeleteUserStudy
      >({
        mutation: this.mutationUpsertUserStudy,
        variables: {
          auth0UserId: auth0UserId,
          nctId: nctId,
        }
      }
    ).subscribe(
      (response: ApolloQueryResult<ResponseUpsertUserStudy>) => {

        this.userStudies
          = cloneDeep(response.data.upsertUserStudy.user.studies);

        // Update the subject.
        this.updatingUserStudies.next(false);
      }
    )
  }

  unfollowStudy(userProfile: Auth0UserProfileInterface, nctId: string) {
    // Retrieve the user ID by removing the `auth0|` prefix from the Auth0
    // user ID.
    const auth0UserId = userProfile.sub
      .replace('auth0|', '');

    // If the given study is not already followed by the user the return.
    if (!this.getUserStudy(nctId)) {
      return null;
    }

    this.updatingUserStudies.next(true);

    // Delete the defined user study in the database and remove it from the
    // `this.userStudies` and update the corresponding subject.
    this.apollo.mutate<
      ResponseDeleteUserStudy,
      VariablesUpsertDeleteUserStudy
      >({
        mutation: this.mutationDeleteUserStudy,
        variables: {
          auth0UserId: auth0UserId,
          nctId: nctId,
        }
      }
    ).subscribe(
      (response: ApolloQueryResult<ResponseDeleteUserStudy>) => {

        this.userStudies
          = cloneDeep(response.data.deleteUserStudy.user.studies);

        // Update the subject.
        this.updatingUserStudies.next(false);
      }
    )
  }

}
