import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from 'angularfire2';
import { McBreadcrumbsComponent, McBreadcrumbsModule, McBreadcrumbsService } from 'ngx-breadcrumbs';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { SearchesService } from './services/searches.service';
import { TrialsManagerService } from './services/trials-manager.service';

import { environment } from '../environments/environment';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
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
    TrialsManagerService,
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
    // Initialize an Apollo GraphQL client pointed to the GraphQL defined in the environment.
    apollo.create({
      link: httpLink.create({uri: environment.graphql.uri}),
      // Enable in-memory cache.
      cache: new InMemoryCache(),
    });
  }
}
