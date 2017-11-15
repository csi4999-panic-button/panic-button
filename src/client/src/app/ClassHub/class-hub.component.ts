import * as io from 'socket.io-client';
import { Component } from '@angular/core';
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
  numberPanic: number;
  token: any;
  currentClassroom: string;
  panicStates: {
    [classroom:string]: boolean,
  };
  panicNumbers: {
    [classroomId: string]: number,
  };
  isPanic: boolean;

  constructor(private http: HttpClient){
    this.panicStates = {};
    this.panicNumbers = {};
    this.currentClassroom = "59ff6909a2bc9d1b4cd10493";
    const url = '/api/v1/authenticate'
    this.isPanic = false;

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
          .on('panic', (event) => {
            console.log(event);
            console.log("panic event")
            this.panicNumbers[event.classroom] = event.panicNumber;
            this.UpdateView();
          })
          .on('panic_state_change', (event) => {
            this.panicStates[event.classroom] = event.state;
             console.log("state change");
            // console.log("panicked", this.panicStates);
            this.UpdateView();
          })
          .on('refresh', (event) => {
            // set values
            this.UpdateView();
          });
      });
  }

  Panic(){
    // set the panic state to the opposite of the current saved state
    this.isPanic = !this.isPanic;
    this.socket.emit("panic", { classroom: this.currentClassroom, state: !this.panicStates[this.currentClassroom] });
    console.log("button hit");
   
  }

  UpdateView(){
    const panicState = this.panicStates[this.currentClassroom];
    this.numberPanic = this.panicNumbers[this.currentClassroom];
    console.log(this.numberPanic);

    // set current number in textbox
    //
    // if panicState true
    //    turn panic number red
    //    panic button text set to "unpanic"
    // else
    //    turn panic number black
    //    panic button text set to "panic"
  }
}
