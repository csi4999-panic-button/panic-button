import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'user-console',
  templateUrl: './user-console.html',
  styleUrls: ['./user-console.css']
})
export class UserConsoleComponent { 

  private HTTP: HttpClient; 
  results: any;
  
  constructor(private http: HttpClient){
    this.HTTP = http;
     this.HTTP.get('/api/v1/classrooms')
          .subscribe((data) => {
            this.results=data
              console.log(this.results);     
           });
  }
  displayedColumns = ['position', 'name', 'weight', 'symbol'];
}