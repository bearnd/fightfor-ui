import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
    private router: Router,
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
      html: 'Per <a href="https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/individual-rights/right-of-access/">' +
        'Art. 15 GDPR Right of access by the data subject</a>, ' +
        'you are entitled to retrieve a copy of the personal data pertaining to you ' +
        'that is stored and processed by this service.' +
        'This is a manual process and may take up to one calendar month ' +
        'to process. ' +
        'This processing period begins on the date we receive a complete ' +
        'and verified request. ' +
        'Verification will be sent to your registered email address ' +
        '(shown below). If you wish to submit this request via a different email, ' +
        'please enter this below.',
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
      html: 'Per <a href="https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/individual-rights/right-to-erasure/">' +
        'Art. 17 GDPR Right to erasure (‘right to be forgotten’)</a>, ' +
        'you are entitled to request the deletion of your ' +
        'account and the personal data that is stored and processed by this service. ' +
        'Please note, this right does not apply in all circumstances and is not absolute. ' +
        'This is a manual process and may take up to one calendar month ' +
        'to process. ' +
        'This processing period begins on the date we receive a complete ' +
        'and verified request. ' +
        'Verification will be sent to your registered email address ' +
        '(shown below). If you wish to submit this request via a different email, ' +
        'please enter this below.',
      footer: this.footer,
      showCancelButton: true,
      showConfirmButton: true,
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-primary btn-dark-blue',
      confirmButtonText: 'Request',
      cancelButtonClass: 'btn btn-rose',
      type: 'warning',
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

  /**
   * Redirects the user to the pricing page.
   */
  onNavigateToPricing() {
    const result = this.router.navigate(['/pricing']);
    result.then();
  }
}
