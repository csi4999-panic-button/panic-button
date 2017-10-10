// import { BrowserModule } from '@angular/platform-browser';
// import { NgModule } from '@angular/core';
// import { MdButtonModule } from '@angular/material';
// import { FormsModule } from '@angular/forms';
// import { AppComponent } from './app.component';
// // import { AppRoutingModule } from './app-routing-module';
// import { LoginPageComponent } from './LoginPage/login-page-component'
// import { RouterModule, Routes } from '@angular/router';

// const appRoutes: Routes = [
//   //{ path: '',   redirectTo: '/login-page', pathMatch: 'full' },
//     { path: 'app-root', component:  AppComponent},
//     { path: 'login-page', component: LoginPageComponent},
//     {
//       path: 'home',
//       component: AppComponent,
//     },
//     { path: '',
//     redirectTo: '/home',
//     pathMatch: 'full'}
// ];

// @NgModule({
//   declarations: [
//     AppComponent,
//     LoginPageComponent
//   ],
//   imports: [
//     BrowserModule,
//     MdButtonModule
//   ],
//   providers: [],
//   bootstrap: [AppComponent]
// })
// export class AppModule { }

import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { FormsModule }          from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MdButtonModule } from '@angular/material';

import { AppComponent }          from './app.component';
import { CrisisListComponent }   from './crisis-list.component';
import { HomePageComponent }     from './home-page.component';
import { PageNotFoundComponent }     from './not-found.component';

const appRoutes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'crisis-center', component: CrisisListComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
  
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    MdButtonModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  declarations: [
    AppComponent,
    HomePageComponent,
    CrisisListComponent,
    PageNotFoundComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
