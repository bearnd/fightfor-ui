import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import {
  PaymentDialogComponent
} from './payment-dialog/payment-dialog.component';
import { PaymentService } from '../services/payment.service';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html'
})
export class PricingComponent implements OnInit {

  // Private behavior subject to indicate when the user and customer profiles
  // are being loaded from their respective services.
  private loadingProfiles: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  // Public observable version of `loadingProfiles` that can be subscribed to
  // by the component template.
  public isLoadingProfiles: Observable<boolean>
    = this.loadingProfiles.asObservable();

  constructor(
    public authService: AuthService,
    private paymentService: PaymentService,
    public router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {

    // Indicate that the profiles are loading.
    this.loadingProfiles.next(true);

    // Subscribe to the `isLoadingUser` observable of the `AuthService`.
    this.authService.isLoadingUser.subscribe(
      (isLoadingUser: boolean) => {
        // If the user-profile isn't loading and has not been populated then
        // load it through the `AuthService.getUserProfile` method.
        if (!isLoadingUser && !this.authService.userProfile) {
          this.authService.getUserProfile();
          // If the user-profile isn't loading and has been populated then use
          // it to get the customer-profile through the `PaymentService`.
        } else if (!isLoadingUser && this.authService.userProfile) {
          // Subscribe to the `isLoadingCustomer` observable of the
          // `PaymentService`.
          this.paymentService.isLoadingCustomer.subscribe(
            (isLoadingCustomer: boolean) => {
              // If the customer-profile isn't loading has not been populated
              // then load it through the `PaymentService.getCustomerProfile`
              // method.
              if (!isLoadingCustomer && !this.paymentService.customerProfile) {
                this.paymentService
                  .getCustomerProfile(this.authService.userProfile);
                // If the customer-profile isn't loading and has been populated
                // then all necessary profiles have been loaded so the
                // `loadingProfiles` subject is updated accordingly to allow
                // the component to render.
              } else if (
                !isLoadingCustomer && this.paymentService.customerProfile
              ) {
                this.loadingProfiles.next(false);
              }
            }
          );
        }
      }
    );

    // If the user is authenticated trigger the loading of the profiles by
    // first loading the user-profile through the `AuthService.getUserProfile`
    // method. Otherwise indicate that profiles are not loading.
    if (this.authService.isAuthenticated()) {
      this.authService.getUserProfile();
    } else {
      this.loadingProfiles.next(false);
    }

  }

  /**
   * Checks if the current user has been authenticated and if they have checks
   * whether the current user has already purchased the premium plan via the
   * `PaymentService`.
   * @returns {boolean} Whether the current user has authenticated and paid or
   * not.
   */
  public isPaid(): boolean {

    if (this.authService.isAuthenticated()) {
      return this.paymentService.isPaid(environment.braintreeGateway.planId);
    } else {
      return false;
    }
  }

  /**
   * Opens a new dialog with the `PaymentDialogComponent` which allows for a
   * new subscription to the premium plan to be made.
   */
  onOpenPaymentDialog() {

    // Create a new dialog configuration object.
    const dialogConfig: MatDialogConfig = new MatDialogConfig();

    // Automatically focus on the dialog elements.
    dialogConfig.autoFocus = true;
    // Allow the user from closing the dialog by clicking outside.
    dialogConfig.disableClose = false;
    // Make the dialog cast a shadow on the rest of the UI behind it and
    // preclude the user from interacting with it.
    dialogConfig.hasBackdrop = true;
    // Make the dialog auto-close if the user navigates away from it.
    dialogConfig.closeOnNavigation = true;
    // Set the dialog dimensions to 60% of the window dimensions.
    dialogConfig.width = '60%';
    dialogConfig.height = '60%';

    // Open the dialog with the given configuration.
    this.dialog.open(PaymentDialogComponent, dialogConfig);
  }
}
