import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject, Observable } from 'rxjs/Rx';

import {
  BraintreeCustomerInterface,
  BraintreeSubscriptionStatusEnum
} from './braintree-gateway.interface';
import { BraintreeGatewayService } from './braintree-gateway.service';
import { Auth0UserProfileInterface } from './auth.service';


@Injectable()
export class PaymentService {

  // The Braintree customer-profile for the currently logged-in user.
  public customerProfile: BraintreeCustomerInterface;

  private loadingCustomer: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  public isLoadingCustomer: Observable<boolean>
    = this.loadingCustomer.asObservable();

  constructor(private braintreeGatewayService: BraintreeGatewayService) {}

  /**
   * Retrieves the Braintree customer for the current Auth0 user. If a
   * Braintree customer does not exist a new one is created.
   * @param {Auth0UserProfileInterface} userProfile The Auth0 user-profile for
   * which a Braintree will be retrieved.
   */
  public getCustomerProfile(userProfile: Auth0UserProfileInterface) {

    // Indicate that the customer-profile is loading.
    this.loadingCustomer.next(true);

    // Retrieve the customer ID by removing the `auth0|` prefix from the Auth0
    // user ID.
    const customerId = userProfile.sub
      .replace('auth0|', '');

    // Retrieve the Braintree customer for the given ID.
    this.braintreeGatewayService.getCustomer(customerId)
      .subscribe(
        (customer: BraintreeCustomerInterface) => {
          this.customerProfile = customer;
          this.loadingCustomer.next(false);
        },
        // If the retrieval returned a 404 then no Braintree customer has been
        // created for the given user in which case a new customer is created.
        (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.braintreeGatewayService.createCustomer(
              customerId,
              userProfile.email,
            ).subscribe(
              (customer: BraintreeCustomerInterface) => {
                this.customerProfile = customer;
                this.loadingCustomer.next(false);
              }
            )
          }
        }
      );
  }

  /**
   * Iterates over the current customer's subscriptions and checks whether the
   * customer has an active subscription to a given pricing plan.
   * @param {string} planId The ID of the pricing plan for which the search is
   * performed.
   * @returns {boolean} Whether the customer has an active subscription to the
   * current pricing plan.
   */
  public isPaid(planId: string): boolean {

    for (const creditCard of this.customerProfile.credit_cards) {
      for (const subscription of creditCard.subscriptions) {
        // Skip subscriptions to plan's other than the one defined different plans.
        if (subscription.plan_id !== planId) {
          continue;
        }

        if (subscription.status !== BraintreeSubscriptionStatusEnum.ACTIVE) {
          continue;
        }

        return true;
      }
    }

    return false;
  }

}
