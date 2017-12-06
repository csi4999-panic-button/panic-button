import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import 'rxjs/add/observable/of';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'user-console',
  templateUrl: './user-console.html',
  styleUrls: ['./user-console.css'],
})
export class UserConsoleComponent implements AfterViewInit {

  private HTTP: HttpClient;
  displayedColumns: string[];
  data: Classroom[];
  dataSource: ClassroomDataSource;
  whoAmI: string;

  @ViewChild('snav') snav: MatSidenav;

  constructor(private http: HttpClient, private router: Router) {
    console.log('Entered constructor');
    this.HTTP = http;
    this.HTTP.get<Classroom[]>('/api/v1/classrooms')
        .subscribe((data) => {
          this.data = data.map(d => { d.role = d.role.charAt(0).toUpperCase() + d.role.slice(1); return d; });
          this.dataSource = new ClassroomDataSource(this.data);
        });
    this.HTTP.get<UserInfo>('/api/v1/users/me')
        .subscribe((data) => {
          this.whoAmI = `${data['firstName']} ${data['lastName']}`;
        });
    this.displayedColumns = ['courseTitle', 'courseNumber', 'sectionNumber', 'role', 'schoolName'];
  }

  ngAfterViewInit() {
    if (window.innerWidth > 650) {
      this.snav.toggle();
    } else {
      this.displayedColumns = ['courseTitle', 'role', 'schoolName'];
    }
  }

  navigateTo(ID: string) {
    this.router.navigate(['/class-hub'], {queryParams: {id: ID}});
  }

  // consider moving this logic to class-hub under Classroom Information
  leaveClassroom(classroom: Classroom, index: number): void {
    const url = `/api/v1/classrooms/${classroom._id}/leave`;
    this.HTTP.post<SuccessResponse>(url, '').subscribe((data) => {
      console.log(data);
      if (data.success) {
        console.log('Successfully left classroom. Removing class from list');
      }
    });
  }
}

export interface Classroom {
  _id: string;
  courseNumber: string;
  courseTitle: string;
  role: string;
  sectionNumber: string;
  schoolId: string;
  schoolName: string;
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export interface SuccessResponse {
  success: boolean;
}

export class ClassroomDataSource extends DataSource<Classroom> {
  data: Classroom[];
  constructor(data: Classroom[]) {
    super();
    this.data = data;
    console.log('data source hit');
    console.log(this.data);
    if (this.data.length > 0) { console.log(this.data[0]); }
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Classroom[]> {
    return Observable.of(this.data);
  }

  disconnect() {}

  // this still cannot dynamically remove rows from the table (no 2-way binding)
  remove(classroomId): any {
    let foundClassroom = false;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i]._id === classroomId) {
        console.log('Match:', this.data[i]);
        this.data.splice(i, 1);
        foundClassroom = true;
      }
    }
    return foundClassroom;
  }
}
