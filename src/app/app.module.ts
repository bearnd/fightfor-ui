import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';

import {
  McBreadcrumbsComponent,
  McBreadcrumbsModule,
  McBreadcrumbsService
} from 'ngx-breadcrumbs';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { NgxBraintreeModule } from 'ngx-braintree';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { JwtModule } from '@auth0/angular-jwt';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { StudyRetrieverService } from './services/study-retriever.service';
import {
  MeshDescriptorRetrieverService
} from './services/mesh-descriptor-retriever.service';
import {
  StudyStatsRetrieverService
} from './services/study-stats-retriever.service';
import { GeolocationService } from './services/geolocation.service';

import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import {
  MatDialogModule,
  MatIconModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { AuthenticationGuard } from './guards/authentication.guard';
import { BraintreeGatewayService } from './services/braintree-gateway.service';
import {
  PaymentDialogComponent
} from './pricing/payment-dialog/payment-dialog.component';
import { PaymentService } from './services/payment.service';
import { PaymentGuard } from './guards/payment.guard';
import { UserConfigService } from './services/user-config.service';
import { SentryErrorHandler } from './utils/sentryerrorhandler';
import {
  StudyBreadcrumbResolverService
} from './components/navbar/breadcrumbs/resolvers/study-breadcrumb-resolver.service';
import {
  StudiesBreadcrumbResolverService
} from './components/navbar/breadcrumbs/resolvers/studies-breadcrumb-resolver.service';
import { getAccessToken } from './shared/utils';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    LoadingBarHttpClientModule,
    McBreadcrumbsModule.forRoot(),
    ApolloModule,
    HttpLinkModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    NgxBraintreeModule,
    MatProgressSpinnerModule,
    SweetAlert2Module.forRoot({
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-rose',
      cancelButtonClass: 'btn btn-danger'
    }),
    // This module will intercept HTTP requests to whitelisted domains and add
    // an `Authorization` header to the request with the access-token retrieved
    // during authentication.
    JwtModule.forRoot({
      config: {
        tokenGetter: getAccessToken,
        whitelistedDomains: [environment.apiGateway.domain],
      }
    }),
    FlexLayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    PaymentDialogComponent,
  ],
  providers: [
    McBreadcrumbsService,
    StudyRetrieverService,
    MeshDescriptorRetrieverService,
    StudyStatsRetrieverService,
    GeolocationService,
    AuthService,
    AuthenticationGuard,
    PaymentGuard,
    BraintreeGatewayService,
    PaymentService,
    UserConfigService,
    {
      provide: ErrorHandler,
      useClass: SentryErrorHandler
    },
    StudyBreadcrumbResolverService,
    StudiesBreadcrumbResolverService,
  ],
  bootstrap: [AppComponent],
  exports: [
    McBreadcrumbsModule,
    McBreadcrumbsComponent,
  ],
  entryComponents: [PaymentDialogComponent],
})
export class AppModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink
  ) {
    // Initialize an Apollo GraphQL client pointed to the GraphQL defined in
    // the environment.
    apollo.create({
      link: httpLink.create({uri: environment.graphql.uri}),
      // Enable in-memory cache.
      cache: new InMemoryCache(),
    });
  }
}
