import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { McBreadcrumbsComponent, McBreadcrumbsModule } from 'ngx-breadcrumbs';
import { BreadcrumbsComponent } from './navbar/breadcrumbs/breadcrumbs.component';
import { MatIconModule, MatMenuModule } from '@angular/material';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    McBreadcrumbsModule.forRoot(),
    MatMenuModule,
    MatIconModule,
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    BreadcrumbsComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    McBreadcrumbsComponent,
    BreadcrumbsComponent,
  ]
})
export class ComponentsModule { }
