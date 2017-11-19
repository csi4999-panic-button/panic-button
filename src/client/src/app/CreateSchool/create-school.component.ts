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
  selector: 'create-school',
  templateUrl: './create-school.html',
  styleUrls: ['./create-school.css']
})
export class CreateSchoolComponent {

  schoolId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  domain: string;
  private HTTP: HttpClient;
  isCreated: boolean;

  schools$: Observable<School[]>;
  private searchTerms = new Subject<string>();
  private updating = false;
  private searching = false;
  private schoolName = '';

  constructor(private http: HttpClient, private schoolService: SchoolSearchService) {
    this.HTTP = http;
  }

  CheckForNulls() {
    if (this.name == null) {
      this.name = '';
    }
    if (this.address == null) {
      this.address = '';
    }
    if (this.city == null) {
      this.city = '';
    }
    if (this.state == null) {
      this.state = '';
    }
    if (this.country == null) {
      this.country = '';
    }
    if (this.zip == null) {
      this.zip = '';
    }
    if (this.domain == null) {
      this.domain = '';
    }
  }

  CreateSchool() {
    const url = '/api/v1/schools';
    this.CheckForNulls();
    // fill request body with school info
    if (!this.name || !this.city || !this.state || !this.country) {
      this.isCreated = false;
      return;
    }
    const newSchoolBody = {
      name: this.name,
      address: this.address,
      city: this.city,
      state: this.state,
      country: this.country,
      zip: this.zip,
      domain: this.domain,
    };
    if (!this.address) { delete newSchoolBody.address; }
    if (!this.zip) { delete newSchoolBody.zip; }
    if (!this.domain) { delete newSchoolBody.domain; }
    // submit the request with filled body
    this.HTTP.post(url, newSchoolBody)
    .subscribe((data) => {
        console.log('New school', data);
    });
    this.isCreated = true;
  }

  UpdateSchool() {
    const url = `/api/v1/schools/${this.schoolId}`;
    this.CheckForNulls();
    // fill request body with school info
    if (!this.name || !this.city || !this.state || !this.country) {
      this.isCreated = false;
      return;
    }
    const newSchoolBody = {
      name: this.name,
      address: this.address,
      city: this.city,
      state: this.state,
      country: this.country,
      zip: this.zip,
      domain: this.domain,
    };
    if (!this.address) { delete newSchoolBody.address; }
    if (!this.zip) { delete newSchoolBody.zip; }
    if (!this.domain) { delete newSchoolBody.domain; }
    // submit the request with filled body
    this.HTTP.put(url, newSchoolBody)
    .subscribe((data) => {
        console.log('New school', data);
    });
    this.isCreated = true;
  }


  setSchoolAndModifier(searchSchool: School) {
    this.searching = false;
    this.updating = true;
    this.schoolId = searchSchool._id;
    this.schoolName = '';
    // set all the fields as well
    this.name = searchSchool.name;
    this.address = searchSchool.address;
    this.city = searchSchool.city;
    this.state = searchSchool.state;
    this.country = searchSchool.country;
    this.zip = searchSchool.zip;

    console.log('school set to', this.name);
  }

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searching = true;
    this.updating = false;
    this.schoolId = '';
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.updating = false;
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
