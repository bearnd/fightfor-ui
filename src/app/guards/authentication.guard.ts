import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthService } from '../services/auth.service';


@Injectable()
export class AuthenticationGuard implements CanActivate, CanActivateChild {

  constructor(private authService: AuthService) {}

  /**
   * Uses the `checkLogin` method to check whether the user is authenticated
   * and whether to permit navigation to guarded routes.
   * @param route The activated route.
   * @param state The router state snapshot.
   * @returns The result of the `checkLogin` method.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    return this.checkLogin();
  }

  /**
   * Uses the `checkLogin` method to check whether the user is authenticated
   * and whether to permit navigation to guarded children routes.
   * @param route The activated route.
   * @param state The router state snapshot.
   * @returns The result of the `checkLogin` method.
   */
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    return this.checkLogin();
  }

  /**
   * Checks whether the user has been authenticated returning a boolean
   * denoting the result and triggers a login if the user is not authenticated.
   * @returns Whether the user has been authenticated.
   */
  private checkLogin(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.authService.login();
      return false;
    }
  }
}
