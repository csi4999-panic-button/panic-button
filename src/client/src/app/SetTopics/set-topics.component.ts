import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';


@Component({
  selector: 'set-topics',
  templateUrl: './set-topics.html',
  styleUrls: ['./set-topics.css']
})
export class SetTopicsComponent {

  private currentClassroomId: string;
  topicsArr: Topic[];
  GoBackLink: string;
  isUpdated: boolean;
  classroomTitle: string;

  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute) {
    this.isUpdated = false;
    this.classroomTitle = '';
    this.route.queryParams.subscribe(params => {
      this.currentClassroomId = params['id'];
      // this.GoBackLink = `/class-hub?id=${this.currentClassroomId}`;
      this.http.get<Classroom>(`/api/v1/classrooms/${this.currentClassroomId}`)
        .subscribe((data) => {
          this.topicsArr = data.topics.map((v) => new Object({ topic: v })) as Topic[];
          // const titlePredicate = (data.courseType || data.courseNumber) ? `${data.courseType} ${data.courseNumber} -` : '';
          this.classroomTitle = ` for ${data.courseTitle}`;
        });
    });
  }

  IncreaseTopicArray() {
    this.topicsArr = [...this.topicsArr, { topic: ''} ];
  }

  ClearTopicArray() {
    this.topicsArr = [];
  }

  RemoveTopic(i: number) {
    this.topicsArr.splice(i, 1);
  }

  SetTopics() {
    const url = `/api/v1/classrooms/${this.currentClassroomId}/topics`;
    this.http.post(url, {topics: this.topicsArr.map(v => v.topic)})
    .subscribe((data) => {
        console.log('Topics set', data);
        this.isUpdated = true;
    });
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

export interface Topic {
  topic: string;
}
