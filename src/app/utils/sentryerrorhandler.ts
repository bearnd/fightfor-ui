import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { environment } from '../../environments/environment';

import * as Sentry from '@sentry/browser';
import * as _ from 'lodash';

import { AuthService } from '../services/auth.service';


Sentry.init({
  dsn: environment.sentry.dsn,
  environment: environment.sentry.environment,
  release: 'fightfor-ui@' + environment.version,
});


@Injectable()
export class SentryErrorHandler implements ErrorHandler {

  private authService: AuthService;

  constructor(private injector: Injector) {
    setTimeout(
      () => {
        this.authService = injector.get(AuthService);
      }
    );
  }

  /**
   * Handles any error not explicitly caught and sends information regarding
   * that error to Sentry. In addition it displays a feedback dialog allowing
   * the user to provide information regarding the error.
   * @param error The error that occurred.
   */
  handleError(error: any) {
    const eventId = Sentry
      .captureException(error.originalError || error);

    // Log the error in the console as long as we're not running in production.
    if (!environment.production) {
      console.error(error);
    }

    Sentry.showReportDialog({
      eventId: eventId,
      dsn: environment.sentry.dsn,
      user: {
        name: _.has(this.authService, ['userProfile', 'name']) ? this.authService.userProfile.name : null,
        email: _.has(this.authService, ['userProfile', 'email']) ? this.authService.userProfile.email : null,
      },
      title: 'Oops seems you encountered an error!',
      subtitle: 'Feel free to leave some feedback as to what you were ' +
                'doing or to just yell at us.',
      labelComments: 'Your feedback'
    });
  }
}
