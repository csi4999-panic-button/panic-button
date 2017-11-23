import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatTableModule } from '@angular/material';
import { MatTabsModule} from '@angular/material';
import { MatListModule} from '@angular/material';
import { MatCardModule} from '@angular/material';
import { MatMenuModule} from '@angular/material';
import { MatExpansionModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { CdkTableModule } from '@angular/cdk/table';
import { ChartsModule } from 'ng2-charts'

import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page.component';
import { PageNotFoundComponent } from './not-found.component';
import { LoginPageComponent } from './LoginPage/login-page.component';
import { AboutUsComponent } from './AboutUs/about-us.component';
import { SignUpComponent } from './SignUp/sign-up.component';
import { UserConsoleComponent} from './UserConsole/user-console.component';
import { ClassHubComponent } from './ClassHub/class-hub.component';
import { CreateClassComponent } from './CreateClass/create-class.component';
import { JoinClassComponent } from './JoinClass/join-class.component';
import { CreateSchoolComponent } from './CreateSchool/create-school.component';
import { SchoolSearchService } from './School/school-search.service';


const appRoutes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'login-page', component: LoginPageComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'user-console', component: UserConsoleComponent },
  { path: 'class-hub', component: ClassHubComponent },
  { path: 'create-class', component: CreateClassComponent},
  { path: 'join-class', component: JoinClassComponent},
  { path: 'create-school', component: CreateSchoolComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatTabsModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatExpansionModule,
    RouterModule.forRoot(
      appRoutes,
      // { enableTracing: true } // <-- debugging purposes only
    ),
    HttpClientModule,
    CdkTableModule,
    ChartsModule,
  ],
  declarations: [
    AppComponent,
    HomePageComponent,
    LoginPageComponent,
    AboutUsComponent,
    SignUpComponent,
    UserConsoleComponent,
    ClassHubComponent,
    CreateClassComponent,
    JoinClassComponent,
    CreateSchoolComponent,
    PageNotFoundComponent,
  ],
  providers: [ SchoolSearchService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
