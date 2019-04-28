import { HttpClient } from '@angular/common/http';

import * as urljoin from 'url-join';

import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { ErrorObservable } from 'rxjs-compat/observable/ErrorObservable';
import {
  BraintreeGatewayToken,
  BraintreeCustomerInterface,
  BraintreeGatewaySubscriptionInterface,
} from './braintree-gateway.interface';


@Injectable()
export class BraintreeGatewayService {

  constructor(private httpClient: HttpClient) {
  }

  /**
   * Retrieves a Braintree customer for a given customer ID through a GET
   * request against the `braintree-gateway` API.
   * @param customerId The Braintree customer ID for which retrieval is
   * performed.
   * @returns The HTTP request observable.
   */
  getCustomer(customerId: string): Observable<BraintreeCustomerInterface> {

    // Assemble the URL.
    const url = urljoin(
      environment.braintreeGateway.uri,
      'customer',
      customerId,
    );

    return this.httpClient.get<BraintreeCustomerInterface>(url);
  }

  /**
   * Creates a new Braintree customer with a given ID and email through a POST
   * request against the `braintree-gateway` API.
   * @param customer_id The ID to be assigned to the new customer.
   * @param email The customer's email.
   * @returns The HTTP request observable.
   */
  createCustomer(
    customer_id: string,
    email: string,
  ): Observable<BraintreeCustomerInterface> {

    // Assemble the URL.
    const url = urljoin(
      environment.braintreeGateway.uri,
      'customer'
    );

    return this.httpClient
      .post<BraintreeCustomerInterface>(
        url,
        {
          customer_id: customer_id,
          email: email,
        }
      );
  }

  /**
   * Creates a new client-token for a given customer through a GET request
   * against the `braintree-gateway` API.
   * @param customerId The Braintree customer ID for which the client-token is
   * created.
   * @returns The HTTP request observable.
   */
  getClientToken(customerId: string): Observable<string> {

    // Assemble the URL.
    const url = urljoin(
      environment.braintreeGateway.uri,
      'client-token',
      customerId,
    );

    return this.httpClient
      .get<BraintreeGatewayToken>(url).map(
        (result: BraintreeGatewayToken) => {
          return result.token;
        }
      ).catch(
        (error) => {
          return new ErrorObservable(error.toString());
        }
      );
  }

  /**
   * Creates a new subscription for a given plan under a given customer through
   * a POST request against the `braintree-gateway` API.
   * @param paymentMethodNonce The payment-method nonce representing a
   * payment-method stored in Braintree.
   * @param customerId The Braintree customer ID for which the subscription is
   * created.
   * @param planId The Braintree plan ID for which the subscription is created.
   */
  createSubscription(
    paymentMethodNonce: string,
    customerId: string,
    planId: string,
  ) {

    // Assemble the URL.
    const url = urljoin(
      environment.braintreeGateway.uri,
      'customer',
      customerId,
      'subscription',
    );

    return this.httpClient
      .post<BraintreeGatewaySubscriptionInterface>(
        url,
        {
          payment_method_nonce: paymentMethodNonce,
          customer_id: customerId,
          plan_id: planId,
        },
      );
  }

}
