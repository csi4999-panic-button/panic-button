import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';

import { School } from '../School/school';
import { SchoolSearchService } from '../School/school-search.service';

@Component({
  selector: 'create-class',
  templateUrl: './create-class.html',
  styleUrls: ['./create-class.css']
})
export class CreateClassComponent {

  schoolId: string;
  courseType: string;
  courseNumber: string;
  sectionNumber: string;
  courseTitle: string;
  private HTTP: HttpClient;
  isCreated: boolean;

  schools$: Observable<School[]>;
  private searchTerms = new Subject<string>();
  private searching = false;
  private schoolName = '';

  constructor(private http: HttpClient, private schoolService: SchoolSearchService) {
    this.HTTP = http;
  }

  CheckForNulls() {
    if (this.schoolId == null) {
      this.schoolId = '';
    }
    if (this.courseType == null) {
      this.courseType = '';
    }
    if (this.courseNumber == null) {
      this.courseNumber = '';
    }
    if (this.sectionNumber == null) {
      this.sectionNumber = '';
    }
    if (this.courseTitle == null) {
      this.courseTitle = '';
    }
  }

  Create() {
    const url = '/api/v1/classrooms';
    this.CheckForNulls();
    // include the schoolId if it has been provided
    let newClassBody = {};
    if (!this.schoolId) {
      newClassBody = {courseType: this.courseType, courseNumber: this.courseNumber, sectionNumber: this.sectionNumber,
        courseTitle: this.courseTitle};
    } else {
      newClassBody = {courseType: this.courseType, courseNumber: this.courseNumber, sectionNumber: this.sectionNumber,
        courseTitle: this.courseTitle, schoolId: this.schoolId };
    }
    // submit the request with filled body
    this.HTTP.post(url, newClassBody)
    .subscribe((data) => {
        console.log('New class', data);
    });
    this.isCreated = true;
    // this.HTTP.get(url)
    // .subscribe((data) => {
    //     console.log(data);
    //  });
  }

  setSchoolAndHide(searchSchool: School) {
    this.searching = false;
    this.schoolId = searchSchool._id;
    this.schoolName = searchSchool.name;
    console.log('schoolId set to', this.schoolId);
  }

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searching = true;
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.schools$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.schoolService.searchSchools(term)),
    );
  }

}
