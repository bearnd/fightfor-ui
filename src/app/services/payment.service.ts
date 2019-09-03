import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import {
  BraintreeCustomerInterface,
  BraintreeSubscriptionStatusEnum
} from './braintree-gateway.interface';
import { BraintreeGatewayService } from './braintree-gateway.service';
import { Auth0UserProfileInterface } from './auth.service';


@Injectable()
export class PaymentService {

  // The Auth0 user-profile for the current logged-in user.
  private userProfile: Auth0UserProfileInterface;

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
   * @param userProfile The Auth0 user-profile for which a Braintree will be
   * retrieved.
   */
  public getCustomerProfile(userProfile: Auth0UserProfileInterface) {

    // Indicate that the customer-profile is loading.
    this.loadingCustomer.next(true);

    // Store the Auth0 user-profile.
    this.userProfile = userProfile;

    // Retrieve the customer ID by removing the `auth0|` prefix from the Auth0
    // user ID.
    const customerId = this.userProfile.sub
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
            );
          }
        }
      );
  }

  /**
   * Iterates over the current customer's subscriptions and checks whether the
   * customer has an active subscription to a given pricing plan.
   * @param planId The ID of the pricing plan for which the search is performed.
   * @returns Whether the customer has an active subscription to the current
   * pricing plan.
   */
  public isPaid(planId: string): boolean {

    // TODO: Remove
    // Temporary payment-check bypass.
    return true;

    // Payment bypass. If a user has been added to either the `Administrators`
    // or `Testers` group via the Auth0 Authorization extension then these users
    // don't need to have an active subscription to be considered 'paid' and
    // use the premium features.
    if (this.userProfile['https://bearnd:auth0:com/app_metadata']) {
      const userAppMetadata = this
        .userProfile['https://bearnd:auth0:com/app_metadata'];
      const userGroups = userAppMetadata.authorization.groups;
      if (
        userGroups.includes('Administrators') ||
        userGroups.includes('Testers')
      ) {
        return true;
      }
    }

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
