import { Component, OnInit } from '@angular/core';
import swal from 'sweetalert2';

import { AuthService, UserIdentityProvider } from '../services/auth.service';
import {
  ClubhousePostStoryResponse,
  ClubhouseService
} from '../services/clubhouse.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  footer = '<p>Email <a href="mailto:support@fightfor.app">' +
    'support@fightfor.app</a></p>';

  constructor(
    public authService: AuthService,
    private clubhouseService: ClubhouseService,
  ) {
  }

  ngOnInit() {
  }

  /**
   * Retrieves a string signifying the identity provider with which the user
   * signed up for this account.
   * @return A string signifying the identity provider with which the user
   * signed up for this account
   */
  getUserIdentityProvider(): string {
    let provider: string = null;
    const identityProvider = this.authService.userProfile.identityProvider;

    if (identityProvider === UserIdentityProvider.FACEBOOK) {
      provider = 'Facebook';
    } else if (identityProvider === UserIdentityProvider.GOOGLE) {
      provider = 'Google';
    } else {
      provider = 'Email';
    }

    return provider;
  }

  /**
   * Shows an alert explaining the process of data-retrieval to the user and
   * allows them to change the email address to which the data will be sent.
   */
  onRequestRetrieval() {
    swal({
      title: 'Request your stored personal data',
      text: 'Per GDPR you are entitled to retrieving a copy of your personal ' +
        'data this service is storing and processing. This is a manual process' +
        'that may take up to 30 days following the request. Your collected data' +
        'will be sent to your registered email address shown below unless you ' +
        'wish to use a different address.',
      footer: this.footer,
      showCancelButton: true,
      showConfirmButton: true,
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-primary btn-dark-blue',
      confirmButtonText: 'Request',
      cancelButtonClass: 'btn btn-rose',
      type: 'info',
      allowOutsideClick: true,
      input: 'text',
      inputPlaceholder: this.authService.userProfile.email,
    }).then(result => {
      if (!result.dismiss) {
        const userEmail = result.value
          ? result.value
          : this.authService.userProfile.email;
        this.clubhouseService.createStory({
          name: 'GDPR Data Request: ' + userEmail,
          description: 'User ' + userEmail + ' requested a copy of their ' +
            'stored data.',
          project_id: environment.clubhouse.supportProjectId,
          story_type: 'chore',
        }).subscribe(
          (_: ClubhousePostStoryResponse) => {
            swal({
              title: 'Submitted',
              text: 'Your request has been submitted.',
              buttonsStyling: false,
              confirmButtonClass: 'btn btn-primary btn-dark-blue',
              type: 'success'
            }).catch(swal.noop);
          }
        );
      }
    }).catch(swal.noop);
  }

  /**
   * Shows an alert explaining the process of account-deletion to the user and
   * allows them to change the email address to which verification will be sent.
   */
  onRequestDeletion() {
    swal({
      title: 'Request deletion of your account and data',
      text: 'Per GDPR you are entitled to requesting the deletion of your ' +
        'account and personal data this service is storing and processing. ' +
        'This is a manual process that may take up to 30 days following the ' +
        'request. Verification will be sent to your registered email address ' +
        'shown below unless you wish to use a different address.',
      footer: this.footer,
      showCancelButton: true,
      showConfirmButton: true,
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-primary btn-dark-blue',
      confirmButtonText: 'Request',
      cancelButtonClass: 'btn btn-rose',
      type: 'info',
      allowOutsideClick: true,
      input: 'text',
      inputPlaceholder: this.authService.userProfile.email,
    }).then(result => {
      if (!result.dismiss) {
        const userEmail = result.value
          ? result.value
          : this.authService.userProfile.email;
        this.clubhouseService.createStory({
          name: 'GDPR Deletion Request: ' + userEmail,
          description: 'User ' + userEmail + ' requested deletion of their ' +
            'account and stored data.',
          project_id: environment.clubhouse.supportProjectId,
          story_type: 'chore',
        }).subscribe(
          (_: ClubhousePostStoryResponse) => {
            swal({
              title: 'Submitted',
              text: 'Your request has been submitted.',
              buttonsStyling: false,
              confirmButtonClass: 'btn btn-primary btn-dark-blue',
              type: 'success'
            }).catch(swal.noop);
          }
        );
      }
    }).catch(swal.noop);
  }
}
