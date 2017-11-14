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

  currentClassroom: string;

  panicStates: {
    [classroom:string]: boolean,
  };

  panicNumbers: {
    [classroomId: string]: number,
  };

  constructor(private http: HttpClient){
    this.panicStates = {};
    this.panicNumbers = {};
    this.currentClassroom = '5a045d038e83e6a7a32d634d';

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
        })
        // event has the form:
        // {
        //   classroom: String - classroom id receiving the event
        //   panicNumber: number - the number of currently panic'd students
        // }
          .on('panic', (event) => {
            console.log(event);
            this.panicNumbers[event.classroom] = event.panicNumber;
            // this.UpdateView(event.panicNumber);
          })
          .on('panic_state_change', (event) => {
            this.panicStates[event.classroom] = event.state;
            console.log("panicked", this.panicStates);
          });
      });
  }

  Panic(){
    // set the panic state to the opposite of the current saved state
    this.socket.emit("panic", { classroom: this.currentClassroom, state: !this.panicStates[this.currentClassroom] });
  }

  UpdateView(panicNumber: number){
    console.log(panicNumber);
  }
}
