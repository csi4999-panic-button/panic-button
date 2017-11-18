import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { DataSource } from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/observable/of';

@Component({
  selector: 'user-console',
  templateUrl: './user-console.html',
  styleUrls: ['./user-console.css']
})
export class UserConsoleComponent { 

  private HTTP: HttpClient; 
  classData: any;
  displayedColumns = ['courseNumber', 'courseTitle', 'role', 'sectionNumber', 'goIcon'];
  data: Element[] = new Array();
  dataSource: ExampleDataSource;
  
  constructor(private http: HttpClient, private router: Router){
    this.HTTP = http;
     this.HTTP.get('/api/v1/classrooms')
          .subscribe((data) => {
            this.classData=data
              console.log(this.classData);
              this.getList(this.classData);
              this.dataSource = new ExampleDataSource(this.data);
           });
           
  }
  getList(data: any)
  {
    var temp: Element;
    for(let i in data)
    {
      temp = {courseNumber: data[i].courseNumber, courseTitle: data[i].courseTitle, 
      role: data[i].role, sectionNumber: data[i].sectionNumber};
      this.data.push(temp);
    }
    console.log(this.data);
    
  }
  navigateTo(link: any){
    this.router.navigate([link]);
  }
}


export interface Element{
  courseNumber: string;
  courseTitle: string;
  role: string;
  sectionNumber: string;
}

export class ExampleDataSource extends DataSource<any> {
  data: Element[]
  constructor(data: Element[]){
    super();
    this.data = data;
    console.log("data source hit");
    console.log(this.data)
   }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Element[]> {
    return Observable.of(this.data);
  }

  disconnect() {}
}