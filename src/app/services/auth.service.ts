import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { mergeMap } from 'rxjs/operators';
import * as auth0 from 'auth0-js';
import { BehaviorSubject, Observable } from 'rxjs/Rx';

import { environment } from '../../environments/environment';

(window as any).global = window;

/**
 * Interface to the Auth0 user-profile object.
 */
export interface Auth0UserProfileInterface {
  email_verified?: boolean
  email?: string
  updated_at?: Date
  name?: string
  picture?: string
  nickname?: string
  created_at?: Date
  sub?: string
}


/**
 * Interface to the Auth0 authentication result object.
 */
export interface Auth0AuthResultInterface {
  accessToken: string
  appState: null
  expiresIn: number
  idToken: string
  refreshToken: string
  scope: string
  state: string
  tokenType: string
}


@Injectable()
export class AuthService {

  // Auth0 client.
  private auth0 = new auth0.WebAuth({
    clientID: environment.auth0.clientID,
    domain: environment.auth0.domain,
    responseType: environment.auth0.responseType,
    redirectUri: environment.auth0.redirectUri,
    scope: environment.auth0.scope,
    audience: environment.auth0.audience,
  });

  // The Auth0 user-profile for the currently logged-in user.
  public userProfile: Auth0UserProfileInterface;

  private loadingUser: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  public isLoadingUser: Observable<boolean>
    = this.loadingUser.asObservable();

  // Access-token renewal subscription.
  private refreshSubscription: any;

  constructor(public router: Router) {
  }

  /**
   * Prompts the user to register and/or log in by redirecting them to Auth0
   * screen which upon successful log in redirects the user back to the app.
   */
  public login(): void {
    this.auth0.authorize();
  }

  /**
   * Processes the authentication hash defined by the `login` method, retrieve
   * the authentication result and create an authentication session.
   */
  public handleAuthentication(): void {
    // Parse the authentication hash and retrieve the authentication result.
    this.auth0.parseHash((err, authResult) => {
      // If parsing the authentication hash is successful store the
      // authentication results as an authentication session and redirect to
      // the home page.
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        const res = this.router.navigate(['/']);
        res.finally()
        // If authentication fails log the error and navigate to the home-page.
      } else if (err) {
        this.router.navigate(['/']);
        // todo: replace with a more elegant error for the user.
        console.log(err);
      }
    });
  }

  /**
   * Stores the contents of the authentication result in the local storage and
   * schedules the access-token renewal.
   * @param {Auth0AuthResultInterface} authResult The authentication result.
   */
  private setSession(authResult: Auth0AuthResultInterface): void {

    // Calculate the access-token expiry time.
    const expiresAt = JSON.stringify(
      (authResult.expiresIn * 1000) + new Date().getTime()
    );

    // Store the authentication results in the local storage.
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);

    this.scheduleRenewal();
  }

  /**
   * Logs the currently logged in user out, removes the authentication
   * session items from local storage, disables token-renewal, and redirects
   * the user to the home-page.
   */
  public logout(): void {
    // Remove tokens and expiry time from localStorage.
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');

    // Disable token-renewal.
    this.unscheduleRenewal();

    // Redirect user to home-page.
    this.router.navigate(['/']);
  }

  /**
   * Checks whether the user is logged in and remains authenticated.
   * @returns {boolean} Whether the user remains authenticated or not,
   */
  public isAuthenticated(): boolean {

    // Retrieve the access-token's expiry time item from local-storage.
    const expires_at = localStorage.getItem('expires_at') || '{}';

    // Parse the expiry time object.
    const expiresAt = JSON.parse(expires_at);

    // Check whether the current time is past the access-token's expiry time
    // and returns the result of the comparison which indicates whether the
    // token has expired, i.e., whether the user is no longer authenticated.
    return new Date().getTime() < expiresAt;
  }

  /**
   * Retrieves the user-profile for the logged in user through the access-token
   * stored in local-storage. It then calls the provided callback function
   * with the retrieved profile data or any error that may have occurred. The
   * retrieved profile data is cached within the class for quick subsequent
   * retrieval.
   * @param {Function} callback The function to call upon retrieval of the user
   * profile.
   */
  public getProfile(callback: Function): void {

    // Retrieve the access-token stored in local-storage.
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      return;
    }

    // Use the `userInfo` method to retrieve the profile and call the provided
    // callback function with the retrieved profile or any error that may have
    // occurred.
    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        self.userProfile = profile;
      }
      callback(err, profile);
    });
  }

  /**
   * Renews the access-token (if possible) and update it in the local storage.
   */
  public renewToken() {
    this.auth0.checkSession({}, (err, result) => {
      if (err) {
        // todo: replace with a more elegant error for the user.
        console.log(err);
      } else {
        this.setSession(result);
      }
    });
  }

  /**
   * Schedule the renewal of the access-token as each current token is about to
   * expire.
   */
  public scheduleRenewal() {

    // If the user is not authenticated then don't schedule the token renewal.
    if (!this.isAuthenticated()) {
      return;
    }

    // Unschedule the renewal so it can be rescheduled anew.
    this.unscheduleRenewal();

    // Retrieve the access-token's expiry time item from local-storage.
    const expires_at = localStorage.getItem('expires_at') || '{}';

    // Parse the expiry time object.
    const expiresAt = JSON.parse(expires_at);

    // Create a new observable that will emit when the currently active
    // access-token expires.
    const expiresIn$ = Observable.of(expiresAt).pipe(
      mergeMap(
        expiryTime => {
          const now = Date.now();
          // Use timer to track delay until expiration to run the refresh at
          // the proper time.
          return Observable.timer(Math.max(1, expiryTime - now));
        }
      )
    );

    // Once the access-token expires and the observable defined above emits
    // then renew the access-token and schedule the next renewal.
    this.refreshSubscription = expiresIn$.subscribe(
      () => {
        this.renewToken();
        this.scheduleRenewal();
      }
    );
  }

  /**
   * Unschedule the access-token renewal.
   */
  public unscheduleRenewal() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  /**
   * Triggers the loading of the user-profile appropriately setting the
   * `loadingUser` subject to indicate whether its loading or not.
   */
  public getUserProfile() {

    // Indicate that the user-profile is loading.
    this.loadingUser.next(true);

    if (!this.userProfile) {
      // Use the `getProfile` to retrieve the user-profile.
      this.getProfile((err, profile) => {
        // Set the retrieved profile to the class member.
        this.userProfile = profile;
        // Indicate that the user-profile is no longer loading.
        this.loadingUser.next(false);
      });
    } else {
      // Indicate that the user-profile is no longer loading.
      this.loadingUser.next(false);
    }
  }

}
