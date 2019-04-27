import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

import swal from 'sweetalert2';

import { PaymentService } from '../services/payment.service';
import { environment } from '../../environments/environment';


@Injectable()
export class PaymentGuard implements CanActivate, CanActivateChild {

  constructor(
    private paymentService: PaymentService,
    private router: Router,
  ) {}

  /**
   * Uses the `checkPayment` method to check whether the user has an active
   * subscription to the premium plan and whether to permit navigation to
   * guarded routes.
   * @param {ActivatedRouteSnapshot} route The activated route.
   * @param {RouterStateSnapshot} state The router state snapshot.
   * @returns {boolean} The result of the `checkPayment` method.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    return this.checkPayment();
  }

  /**
   * Uses the `checkPayment` method to check whether the user has an active
   * subscription to the premium plan and whether to permit navigation to
   * guarded children routes.
   * @param {ActivatedRouteSnapshot} route The activated route.
   * @param {RouterStateSnapshot} state The router state snapshot.
   * @returns {boolean} The result of the `checkPayment` method.
   */
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    return this.checkPayment();
  }

  /**
   * Checks whether the user has an active subscription to the premium plan
   * returning a boolean denoting the result and triggering an alert if the
   * user has not paid.
   * @returns {boolean} Whether the user has an active subscription to the
   * premium plan.
   */
  private checkPayment() {
    if (this.paymentService.isPaid(environment.braintreeGateway.planId)) {
      return true;
    } else {
      swal({
        title: 'Page not available to your plan!',
        text: 'The page you are trying to navigate to is only available to ' +
          'the premium plan. Would you like to start your 7-day free trial?',
        footer: '<p>Email <a href="mailto:support@bearnd.io">support@bearnd.io</a></p>',
        showCancelButton: true,
        showConfirmButton: true,
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-rose',
        cancelButtonClass: 'btn btn-danger',
        confirmButtonText: 'Go to pricing',
        cancelButtonText: 'No thanks',
        type: 'warning'
      }).then(result => {
        if (result.value) {
          const res = this.router.navigate(['/pricing']);
          res.then();
        } else {
          return false;
        }
      }).catch(swal.noop);

      return false;
    }
  }
}
