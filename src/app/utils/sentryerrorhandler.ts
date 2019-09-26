import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { environment } from '../../environments/environment';

import * as Sentry from '@sentry/browser';
import * as _ from 'lodash';
import swal from 'sweetalert2';

import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


Sentry.init({
  dsn: environment.sentry.dsn,
  environment: environment.sentry.environment,
  release: 'fightfor-ui@' + environment.version,
});


@Injectable()
export class SentryErrorHandler implements ErrorHandler {

  private authService: AuthService;
  private httpClient: HttpClient;
  private isDialogOpen = false;

  constructor(private injector: Injector) {
    setTimeout(
      () => {
        this.authService = injector.get(AuthService);
        this.httpClient = injector.get(HttpClient);
      }
    );
  }

  /**
   * Assembles the Sentry feedback URL based on the dialog parameters.
   * @param eventId The ID of the Sentry event created over a new error.
   * @param name The name of the user sending feedback.
   * @param email The email of the user sending feedback.
   * @param title The title used in the feedback dialog.
   * @param subtitle The subtitle used in the feedback dialog.
   * @param labelComments The user feedback provided via the dialog.
   */
  assembleSentryFeedbackUrl(
    eventId: string,
    name: string | null,
    email: string | null,
    title: string,
    subtitle: string,
    labelComments: string | null,
  ): string {
    return encodeURI(
      'https://sentry.io/api/embed/error-page/' +
      '?dsn=' + environment.sentry.dsn +
      '&eventId=' + eventId +
      '&dsn=' + environment.sentry.dsn +
      '&name=' + name +
      '&email=' + email +
      '&title=' + title +
      '&subtitle=' + subtitle +
      '&labelComments=' + labelComments
    );
  }

  /**
   * Assembles the Sentry feedback form-data based on the dialog parameters.
   * @param name The name of the user sending feedback.
   * @param email The email of the user sending feedback.
   * @param labelComments The user feedback provided via the dialog.
   */
  assembleSentryFeedbackFormData(
    name: string | null,
    email: string | null,
    labelComments: string | null,
  ): string {
    return encodeURI(
      'name=' + name +
      '&email=' + email +
      '&comments=' + labelComments +
      '&='
    );
  }

  /**
   * Display a SweetAlert feedback dialog so that the user can provide feedback
   * over the encountered error.
   * @param eventId The ID of the Sentry event created over a new error.
   */
  showFeedbackDialog(eventId: string) {
    // Define the components of the feedback dialog.
    const title = 'Oops seems you encountered an error!';
    const subtitle = 'Feel free to leave some feedback as to what you were ' +
      'doing or to just yell at us.';
    // Use the name and the email of the currently logged in user to use a
    // default if unavailable.
    const name = _.has(
      this.authService, ['userProfile', 'name']
    ) ? this.authService.userProfile.name : 'support@fightfor.app';
    const email = 'support@fightfor.app';
    const footer = '<p>Email <a href="mailto:support@fightfor.app">' +
      'support@fightfor.app</a></p>';

    // Assemble request headers.
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    // Show a SweetAlert dialog prompting the user to provide feedback over the
    // encountered error.
    swal({
      title: title,
      text: subtitle,
      footer: footer,
      showCancelButton: true,
      showConfirmButton: true,
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-rose',
      confirmButtonText: 'Submit',
      cancelButtonClass: 'btn btn-rose',
      type: 'warning',
      allowOutsideClick: true,
      input: 'textarea',
      inputPlaceholder: 'Type your message here...',
    }).then(result => {
      if (result.value) {
        this.httpClient.post(
          this.assembleSentryFeedbackUrl(
            eventId, name, email, title, subtitle, result.value,
          ),
          this.assembleSentryFeedbackFormData(name, email, result.value),
          {headers: headers},
        ).subscribe();
      }
    }).catch(swal.noop);
  }

  /**
   * Handles any error not explicitly caught and sends information regarding
   * that error to Sentry. In addition it displays a feedback dialog allowing
   * the user to provide information regarding the error.
   * @param error The error that occurred.
   */
  handleError(error: any) {
    // Capture the error and create a new Sentry event.
    const eventId = Sentry
      .captureException(error.originalError || error);

    // Log the error in the console as long as we're not running in production.
    if (!environment.production) {
      console.error(error);
    }

    this.showFeedbackDialog(eventId);
  }
}
