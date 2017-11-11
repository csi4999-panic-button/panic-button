import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'join-class',
  templateUrl: './join-class.html',
  styleUrls: ['./join-class.css']
})
export class JoinClassComponent {

    inviteCode: string
    private HTTP: HttpClient;
    isCreated: boolean
    
    constructor(private http: HttpClient){
      this.HTTP = http;
    }
    Join(){
        const url = '/api/v1/classrooms';
        if(this.inviteCode != null){
         this.HTTP.post(url, {inviteCode: this.inviteCode})
         .subscribe((data) => {
             console.log(data["api hit"]);    
          });
          this.isCreated = true; 
          this.HTTP.get(url)
          .subscribe((data) => {
              console.log(data);     
           });
        }
    }
}