import { Component, OnInit } from '@angular/core';
import { Auth0UserProfileInterface, AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit {

  public userProfile: Auth0UserProfileInterface;
  public showSidebar = false;

  constructor(
    public authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      if (this.authService.userProfile) {
        this.userProfile = this.authService.userProfile;
      } else {
        this.authService.getProfile((err, profile) => {
          this.userProfile = profile;
        });
      }
    }
  }

  /**
   * Redirects the user to log in or register via Auth0.
   */
  onLoginRegister() {
    this.authService.login();
  }

  /**
   * Logs out the currently logged in user.
   */
  onLogout() {
    this.authService.logout();
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  /**
   * Sets the `showSidebar` member variable to `false` when then sidebar is
   * closed (typically by clicking outside the sidebar).
   */
  onSidenavClosed() {
    this.showSidebar = false;
  }
}
