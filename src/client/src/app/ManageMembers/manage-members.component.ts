import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MatGridListModule } from '@angular/material';


@Component({
  selector: 'manage-members',
  templateUrl: './manage-members.html',
  styleUrls: ['./manage-members.css']
})
export class ManageMembersComponent {

  currentClassroomId: string;
  users: PanicUser[];
  classroomTitle: string;

  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute) {
    this.classroomTitle = '';
    this.users = [] as PanicUser[];
    this.route.queryParams.subscribe(params => {
      this.currentClassroomId = params['id'];
      // this.GoBackLink = `/class-hub?id=${this.currentClassroomId}`;
      this.http.get<ClassroomUsersResponse>(`/api/v1/classrooms/${this.currentClassroomId}/users`)
        .subscribe((data) => {
          if (data.success) {
            this.users = data.users;
          } else {
            this.users = [] as PanicUser[];
          }
        });
      this.http.get<Classroom>(`/api/v1/classrooms/${this.currentClassroomId}`)
        .subscribe((data) => {
          this.classroomTitle = ` for ${data.courseTitle}`;
        });
    });
  }

  RemoveUser(i: number) {
    const deleteUser = this.users[i];
    this.http.delete<DeleteUserResponse>(`/api/v1/classrooms/${this.currentClassroomId}/${deleteUser.role}/${deleteUser.info._id}`)
      .subscribe((data) => {
        if (data.success) {
          if (this.users[i].info._id === data.userId) {
            this.users.splice(i, 1);
          } else {
            console.log('That user was already removed');
          }
        } else {
          console.log(`Failed to delete user: ${data.message}`);
        }
      });
  }

  getRoleOf(role: string) {
    switch (role) {
      case('teacher'):
        return 'T';
      case('teacherAssistant'):
        return 'TA';
      case('student'):
        return 'S';
      default:
        return 'N/A';
    }
  }

  navigateToClassHub(ID: string) {
    this.router.navigate(['/class-hub'], {queryParams: {id: ID}});
  }

}

export interface Classroom {
  _id: string;
  courseNumber: string;
  courseTitle: string;
  role: string;
  courseType: string;
  sectionNumber: string;
  topics: string[];
  currentTopic: number;
}

export interface PanicUser {
  role: string;
  info: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ClassroomUsersResponse {
  success: boolean;
  users: PanicUser[];
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
  userId: string;
}
