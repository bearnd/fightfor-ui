import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule} from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';

import { environment } from '../environments/environment';

import {
  AgmCoreModule
} from '@agm/core';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { SearchesService } from './searches/searches.service';

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
    SlimLoadingBarModule.forRoot()
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
  ],
  providers: [SearchesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
