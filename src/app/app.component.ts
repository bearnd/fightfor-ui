import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    public auth: AuthService,
    private router: Router,
  ) {
    auth.handleAuthentication();
    auth.scheduleRenewal();
  }

  ngOnInit() {
    const result = this.router.navigate(['']);
    result.then();
  }
}
