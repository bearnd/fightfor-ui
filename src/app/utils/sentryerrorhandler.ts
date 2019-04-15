import { ErrorHandler, Injectable } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { environment } from '../../environments/environment';

Sentry.init({
  dsn: environment.sentry.dsn,
  environment: environment.production ? 'production' : 'development',
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {

  constructor() {}

  /**
   * Handles any error not explicitly caught and sends information regarding
   * that error to Sentry. In addition it displays a feedback dialog allowing
   * the user to provide information regarding the error.
   * @param {any} error The error that occurred.
   */
  handleError(error: any) {
    const eventId = Sentry.captureException(error.originalError || error);

    // Set basic placeholder info.
    const userEmail = 'Your email (so we can contact you once the ' +
                    'issue is resolved)';
    const userName = 'Your name (feel free to write "N/A")';

    // Log the error in the console as long as we're not running in production.
    if (!environment.production) {
      console.error(error);
    }

    // Show a feedback dialog to allow the user to provide feedback regarding
    // the error.
    Sentry.showReportDialog(
      {
        eventId: eventId,
        user: {
          email: userEmail,
          name: userName,
        }
      });
  }
}
