import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import swal from 'sweetalert2';

import {
  BraintreeGatewayService
} from '../../services/braintree-gateway.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import {
  BraintreeGatewaySubscriptionInterface
} from '../../services/braintree-gateway.interface';
import { PaymentService } from '../../services/payment.service';


@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html'
})
export class PaymentDialogComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private braintreeGatewayService: BraintreeGatewayService,
    public paymentService: PaymentService,
    private dialogRef: MatDialogRef<PaymentDialogComponent>,
  ) {
  }

  ngOnInit() {}

  getClientToken(): Observable<string> {

    return this.braintreeGatewayService
      .getClientToken(this.paymentService.customerProfile.id)
      .map(
        (token: string) => {
          return token;
        }
      );
  }

  createPurchase(paymentMethodNonce: string, amount: number) {

    return this.braintreeGatewayService
      .createSubscription(
        paymentMethodNonce,
        this.paymentService.customerProfile.id,
        environment.braintreeGateway.planId,
      );
  }

  onPaymentStatus(event: BraintreeGatewaySubscriptionInterface) {
    if (event.id) {
      swal({
        title: 'Thank you!',
        text: 'Your 7-day trial has started (you can cancel anytime).',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-rose',
        type: 'success'
      }).catch(swal.noop);
      // Trigger the loading of the profiles to retrieve the updated versions.
      this.paymentService.getCustomerProfile(this.authService.userProfile);
    } else {
      swal({
        title: 'Subscription unsuccessful!',
        text: 'An error occured while establishing a subscription.',
        footer: '<p>Email <a href="mailto:support@bearnd.io">support@bearnd.io</a></p>',
        buttonsStyling: false,
        confirmButtonClass: 'btn btn-rose',
        type: 'error'
      }).catch(swal.noop);
    }

    this.dialogRef.close();
  }
}
