import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { UUID } from 'angular2-uuid';

import { environment } from '../../environments/environment';
import * as urljoin from "url-join";


export interface ClubhousePostStoryRequest {
  // comments
  completed_at_override?: Date;
  created_at?: Date;
  deadline?: Date;
  description: string;
  epic_id?: number;
  estimate?: number;
  external_id?: number;
  // file_ids
  // follower_ids
  iteration_id?: number;
  // TODO: labels
  // linked_file_ids
  name: string;
  // owner_ids
  project_id: number;
  requested_by_id?: UUID;
  started_at_override?: Date;
  // story_links
  story_type?: string;
  // tasks
  updated_at?: Date;
  workflow_state_id?: number;
}

export interface ClubhousePostStoryResponse {
  app_url: string;
  archived: boolean;
  blocked: boolean;
  blocker: boolean;
  // branches
  // comments
  // commits
  completed: boolean;
  completed_at: Date;
  completed_at_override: Date;
  created_at: Date;
  deadline: Date;
  description: string;
  entity_type: string;
  epic_id: number;
  estimate: number;
  external_id: number;
  // files
  // follower_ids
  id: number;
  iteration_id: number;
  // labels
  // linked_files
  // mention_ids
  moved_at: Date;
  name: string;
  // owner_ids
  position: number;
  project_id: number;
  requested_by_id: string;
  started: boolean;
  started_at: Date;
  started_at_override: Date;
  // story_links
  story_type: string;
  // tasks
  updated_at: Date;
  workflow_state_id: number;
}


@Injectable()
export class ClubhouseService {

  constructor(private httpClient: HttpClient) {}

  /**
   * Creates a new Cluhouse story via the corresponding API endpoint.
   * @param requestBody The request parameters to be used against the Clubhouse
   * endpoint.
   * @returns An observable of the response.
   */
  createStory(
    requestBody: ClubhousePostStoryRequest,
  ): Observable<ClubhousePostStoryResponse> {
    const url = urljoin(
      environment.clubhouse.uri,
      'api/v2/stories',
    );

    return this.httpClient.post<ClubhousePostStoryResponse>(
      url,
      requestBody,
    );
  }
}
