import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AgmCoreModule } from '@agm/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { McBreadcrumbsComponent, McBreadcrumbsModule, McBreadcrumbsService } from 'ngx-breadcrumbs';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

import { SearchesService } from './searches/searches.service';

import { environment } from '../environments/environment';


@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    SlimLoadingBarModule.forRoot(),
    McBreadcrumbsModule.forRoot()
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
  ],
  providers: [SearchesService, McBreadcrumbsService],
  bootstrap: [AppComponent],
  exports: [
    McBreadcrumbsModule,
    McBreadcrumbsComponent
  ]
})
export class AppModule { }
