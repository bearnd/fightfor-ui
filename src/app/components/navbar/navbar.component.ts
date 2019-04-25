import { Component, OnInit, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable } from 'rxjs/Rx';

import { ROUTES } from '../sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { UserConfigService } from '../../services/user-config.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private listTitles: any[];
  location: Location;
  public mobile_menu_visible: any = 0;
  private toggleButton: any;
  private sidebarVisible: boolean;

  // Private behavior subject to indicate when the user and customer profiles
  // are being loaded from their respective services.
  private loadingProfiles: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(false);
  // Public observable version of `loadingProfiles` that can be subscribed to
  // by the component template.
  public isLoadingProfiles: Observable<boolean>
    = this.loadingProfiles.asObservable();

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private authService: AuthService,
    public paymentService: PaymentService,
    private userConfigService: UserConfigService,
  ) {
    this.location = location;
    this.sidebarVisible = false;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);

    const navbar: HTMLElement = this.element.nativeElement;

    this.toggleButton = navbar
      .getElementsByClassName('navbar-toggler')[0];

    this.router.events.subscribe((event) => {
      this.sidebarClose();
      const $layer: any = document
        .getElementsByClassName('close-layer')[0];
      if ($layer) {
        $layer.remove();
        this.mobile_menu_visible = 0;
      }
    });

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

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    setTimeout(function () {
      toggleButton.classList.add('toggled');
    }, 500);

    body.classList.add('nav-open');

    this.sidebarVisible = true;
  }

  sidebarClose() {
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    body.classList.remove('nav-open');
  }

  sidebarToggle() {
    const $toggle = document
      .getElementsByClassName('navbar-toggler')[0];

    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
    const body = document.getElementsByTagName('body')[0];

    if (this.mobile_menu_visible === 1) {
      body.classList.remove('nav-open');
      const $layer: any = document
        .getElementsByClassName('close-layer')[0];
      if ($layer) {
        $layer.remove();
      }
      setTimeout(function () {
        $toggle.classList.remove('toggled');
      }, 400);

      this.mobile_menu_visible = 0;
    } else {
      setTimeout(function () {
        $toggle.classList.add('toggled');
      }, 430);

      const $layer = document.createElement('div');

      $layer.setAttribute('class', 'close-layer');

      if (body.querySelectorAll('.main-panel')) {
        document.getElementsByClassName('main-panel')[0]
          .appendChild($layer);
      } else if (body.classList.contains('off-canvas-sidebar')) {
        document.getElementsByClassName('wrapper-full-page')[0]
          .appendChild($layer);
      }

      setTimeout(function () {
        $layer.classList.add('visible');
      }, 100);

      // Assign a function.
      $layer.onclick = function () {
        body.classList.remove('nav-open');
        this.mobile_menu_visible = 0;
        $layer.classList.remove('visible');
        setTimeout(function () {
          $layer.remove();
          $toggle.classList.remove('toggled');
        }, 400);
      }.bind(this);

      body.classList.add('nav-open');
      this.mobile_menu_visible = 1;

    }
  }

  getTitle() {
    let title = this.location.prepareExternalUrl(this.location.path());
    if (title.charAt(0) === '#') {
      title = title.slice(2);
    }
    title = title.split('/').pop();

    for (let item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === title) {
        return this.listTitles[item].title;
      }
    }
    return 'Dashboard';
  }

  /**
   * Logs out the current user.
   */
  onLogout() {
    this.authService.logout();
  }
}
