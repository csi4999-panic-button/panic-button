import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material';
import { MatInputModule } from '@angular/material';
import { MatTableModule } from '@angular/material';
import { MatTabsModule} from '@angular/material';
import { MatListModule} from '@angular/material';
import { MatCardModule} from '@angular/material';
import { MatMenuModule} from '@angular/material';
import { MatSidenavModule } from '@angular/material';
import { MatExpansionModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { CdkTableModule } from '@angular/cdk/table';
import { ChartsModule } from 'ng2-charts';
import { ClipboardModule } from 'ngx-clipboard';

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
import { SetTopicsComponent } from './SetTopics/set-topics.component';
import { ManageMembersComponent } from './ManageMembers/manage-members.component';
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
  { path: 'set-topics', component: SetTopicsComponent },
  { path: 'manage-members', component: ManageMembersComponent },
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
    MatSidenavModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    RouterModule.forRoot(
      appRoutes,
      // { enableTracing: true } // <-- debugging purposes only
    ),
    HttpClientModule,
    CdkTableModule,
    ChartsModule,
    ClipboardModule,
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
    SetTopicsComponent,
    ManageMembersComponent,
  ],
  providers: [ SchoolSearchService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
