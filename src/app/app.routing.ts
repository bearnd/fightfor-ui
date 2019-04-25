import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import {
  AuthLayoutComponent
} from './layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthenticationGuard } from './guards/authentication.guard';


const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './layouts/auth-layout/auth-layout.module#AuthLayoutModule'
      }
    ]
  },
  {
    path: 'app',
    component: AdminLayoutComponent,
    canActivate: [AuthenticationGuard],
    canActivateChild: [AuthenticationGuard],
    children: [
      {
        path: '',
        loadChildren: './layouts/admin/admin-layout.module#AdminLayoutModule'
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [],
})
export class AppRoutingModule {
}
