import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

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

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import {
  AdminLayoutComponent
} from './layouts/admin-layout/admin-layout.component';
import { SearchesService } from './services/searches.service';
import { StudyRetrieverService } from './services/study-retriever.service';
import {
  MeshDescriptorRetrieverService
} from './services/mesh-descriptor-retriever.service';
import {
  StudyStatsRetrieverService
} from './services/study-stats-retriever.service';
import { GeolocationService } from './services/geolocation.service';

import { environment } from '../environments/environment';
import {
  CitationRetrieverService
} from './services/citation-retriever.service';
import {
  CitationStatsRetrieverService
} from './services/citation-stats-retriever.service';
import { AuthService } from './services/auth.service';
import {
  AuthLayoutComponent
} from './layouts/auth-layout/auth-layout.component';
import {
  MatDialogModule,
  MatIconModule,
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


@NgModule({
  imports: [
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
    })
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    PaymentDialogComponent,
  ],
  providers: [
    SearchesService,
    McBreadcrumbsService,
    StudyRetrieverService,
    MeshDescriptorRetrieverService,
    StudyStatsRetrieverService,
    GeolocationService,
    CitationRetrieverService,
    CitationStatsRetrieverService,
    AuthService,
    AuthenticationGuard,
    PaymentGuard,
    BraintreeGatewayService,
    PaymentService,
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
