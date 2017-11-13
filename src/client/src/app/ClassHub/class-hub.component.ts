import { Component } from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';


@Component({
  selector: 'class-hub',
  templateUrl: './class-hub.html',
  styleUrls: ['./class-hub.css']
})
export class ClassHubComponent {
  socket: any;
  private HTTP: HttpClient;
  token: any;
  panicState: boolean;
  panicNumbers: {
    [classroomId: string]: number,
  };
  classString: String;
  panicNumber: number;
  
  constructor(private http: HttpClient){
    this.panicState = false;
    const url = '/api/v1/authenticate'
    http.post(url, {})
    .subscribe((data) => {
      this.token = data["token"];
      this.socket = io();
      this.socket.on('connect', () => {
        this.socket.emit('login', this.token);
      });

      this.socket.on('login_success', function(sucess:boolean){
        console.log('connected', sucess);
      });

       // event has the form:
        // {
        //   classroom: String - classroom id receiving the event
        //   panicNumber: number - the number of currently panic'd students
        // }
      this.socket.on('panic', (event) => {
        console.log(event);
        // this.panicNumbers[event.classroom] = this.panicNumber;
        // this.UpdateView(this.panicNumber);
      })
     });
  }

  Panic(){
    this.socket.emit("panic", { classroom: "59ff6909a2bc9d1b4cd10493", state: true});
    this.panicState = !this.panicState;
    console.log(this.panicState);
  }

  UpdateView(panicNumber: number){
    console.log(panicNumber);
  }
 }