import { Component, OnInit } from '@angular/core';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private clubhouseService: ClubhouseService,
  ) {
  }

  ngOnInit() {
  }

  /**
   * Retrieves a string signifying the identity provider with which the user
   * signed up for this account.
   * @return A string signifying the identity provider with which the user
   * signed up for this account
   */
  getUserIdentityProvider(): string {
    let provider: string = null;
    const identityProvider = this.authService.userProfile.identityProvider;

    if (identityProvider === UserIdentityProvider.FACEBOOK) {
      provider = 'Facebook';
    } else if (identityProvider === UserIdentityProvider.GOOGLE) {
      provider = 'Google';
    } else {
      provider = 'Email';
    }

    return provider;
  }
}
