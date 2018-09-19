import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
  ],
  providers: [
    SearchesService,
    McBreadcrumbsService,
    StudyRetrieverService,
    MeshDescriptorRetrieverService,
    StudyStatsRetrieverService,
    GeolocationService,
  ],
  bootstrap: [AppComponent],
  exports: [
    McBreadcrumbsModule,
    McBreadcrumbsComponent,
  ]
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
