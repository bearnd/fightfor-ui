import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { UserConfigService } from '../../services/user-config.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  // Private behavior subject to indicate when the user and customer profiles
  // are being loaded from their respective services.
  private loadingProfiles: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService,
    public paymentService: PaymentService,
    private userConfigService: UserConfigService,
  ) {
  }

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

    // Subscribe to the `isLoadingUser` observable of the `AuthService`.
    this.authService.isLoadingUser.subscribe(
      // If the Auth0 user-profile isn't loading but has been populated then
      // load the DB user profiles through the
      // `UserConfigService.getUserProfile` method.
      (isLoadingUser: boolean) => {
        if (
          !isLoadingUser &&
          !this.userConfigService.userConfig &&
          this.authService.userProfile
        ) {
          this.userConfigService.getUserConfig(this.authService.userProfile);
        }
      }
    );

    // Trigger the loading of the profiles by first loading the user-profile
    // through the `AuthService.getUserProfile` method.
    this.authService.getUserProfile();

  }

    /**
   * Logs out the currently logged in user.
   */
  onLogout() {
    this.authService.logout();
  }

}
