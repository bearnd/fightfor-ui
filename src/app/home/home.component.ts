import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  /**
   * Redirects the user to log in or register via Auth0.
   */
  onLoginRegister() {
    this.authService.login();
  }

  /**
   * Redirects the user to the app.
   */
  onGoToApp() {
    const result = this.router.navigate(['/app']);
    result.then();
  }
}
