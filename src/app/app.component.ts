import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // URL paths to which deep-linking is permitted.
  private pathsWhitelistedDeepLinking: string[] = [
    '/pricing',
    '/faq',
    '/tos',
    '/privacy',
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {
    auth.handleAuthentication();
    auth.scheduleRenewal();
  }

  ngOnInit() {
    // If the URL path is one of the whitelisted ones then permit deep-linking.
    // Otherwise redirect to the homepage.
    if (!this.pathsWhitelistedDeepLinking.includes(window.location.pathname)) {
      const result = this.router.navigate(['']);
    result.then();
    }
  }
}
