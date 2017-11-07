import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

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
    isCreated: boolean
    
    constructor(private http: HttpClient){
      this.HTTP = http;
    }
  
    CheckForNulls()
    {
      if(this.schoolId == null)
      {
        this.schoolId = ""
      }
      if(this.courseType == null)
      {
        this.courseType = ""
      }
      if(this.courseNumber == null)
      {
        this.courseNumber = ""
      }
      if(this.sectionNumber == null)
      {
        this.sectionNumber = ""
      }
      if(this.courseTitle == null)
      {
        this.courseTitle = ""
      }
    }
  
    Create(){
      const url = '/api/v1/classrooms';
      this.CheckForNulls();
       this.HTTP.post(url, 
        {courseType:this.courseType, courseNumber: this.courseNumber, sectionNumber: this.sectionNumber,
        courseTitle: this.courseTitle})
       .subscribe((data) => {
           console.log(data["courseTitle"]);    
        });
        this.isCreated = true; 
        // this.HTTP.get(url)
        // .subscribe((data) => {
        //     console.log(data);     
        //  });
      }

      
      
}