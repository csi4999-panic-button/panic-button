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
  currentClassroomId: string;
  panicStates: {[classroom:string]: boolean,};
  panicNumbers: {[classroomId: string]: number,};
  isPanic: boolean;
  classroomObject: any;
  courseTitle: string;
  courseNumber: string;
  studentCount: number;
  percentPanicked: number;
  studentCode: string;
  teacherCode: string;
  questions: any;
  role: string;
  newQuestion: string;
  isQuestionAsked: boolean;
  replyMode: boolean;
  replyQuestionId: string;
  replyQuestion: string;
  questionAnswer:string;

  constructor(private http: HttpClient){
    this.HTTP = http;
    this.panicStates = {};
    this.panicNumbers = {};
    this.currentClassroomId = "5a107ed21201b52acc54482e";
    const url = '/api/v1/authenticate'
    this.isPanic = false;
    this.courseTitle = "";
    this.courseNumber = "";
    this.numberPanic = 0;
    this.percentPanicked = 0;
    this.isQuestionAsked = false;
    this.newQuestion= ""
    this.replyMode = false;
    this.questionAnswer="";

    this.GetClassroomObject();
    
    http.post(url, {})
      .subscribe((data) => {
        this.token = data["token"];
        this.socket = io();
        this.socket.on('connect', () => {
          this.socket.emit('login', this.token);
        });

        //login
        this.socket.on('login_success', function(sucess:boolean){
          console.log('connected', sucess);
        })
        //Panic Events
          .on('panic', (event) => {
            console.log(event);
            console.log("panic event")
            this.panicNumbers[event.classroom] = event.panicNumber;
            this.UpdatePanicView();
          })
          .on('panic_state_change', (event) => {
            this.panicStates[event.classroom] = event.state;
             console.log("state change");
            // console.log("panicked", this.panicStates);
            this.UpdatePanicView();
          })
          .on('refresh', (event) => {
            // set values
            this.UpdatePanicView();
          })
          .on('new_question', (event) => {
            if(this.classroomObject.length != event.numberOfQuestions)
            {
              this.GetClassroomObject();
            }    
          })
          .on('new_answer', (event) => {
            console.log(event)
            this.GetClassroomObject();
          })
      });
  }

  Panic(){
    this.socket.emit("panic", { classroom: this.currentClassroomId, state: !this.panicStates[this.currentClassroomId] });
    console.log("button hit");
  }

  NewQuestion(){
    const url = '/api/v1/classrooms/' + this.currentClassroomId + '/questions'
    if(!this.isQuestionAsked && this.newQuestion != "")
    {
      this.HTTP.post(url, {question: this.newQuestion})
      .subscribe((data) => {});
      this.isQuestionAsked = !this.isQuestionAsked;
    }
    else
    {
      this.isQuestionAsked = !this.isQuestionAsked;
      this.newQuestion = "";
    }
    
  }

  UpdatePanicView(){
    this.isPanic = this.panicStates[this.currentClassroomId];
    this.numberPanic = this.panicNumbers[this.currentClassroomId];
    this.percentPanicked = Math.round(this.numberPanic * 100/this.studentCount);
  }

  GetClassroomObject(){
    this.HTTP.get(`/api/v1/classrooms/${this.currentClassroomId}`)
    .subscribe((data) => {
      this.classroomObject=data
        console.log(this.classroomObject);
        this.courseNumber = this.classroomObject.courseNumber;
        this.courseTitle = this.classroomObject.courseTitle;
        this.role = this.classroomObject.role;
        if(this.classroomObject.students)
        {
          this.studentCount = this.classroomObject.students.length;
        }
        if(this.classroomObject.studentCode)
        {
          this.studentCode = this.classroomObject.studentCode;
        }

        if(this.classroomObject.teacherCode)
        {
          this.teacherCode = this.classroomObject.teacherCode;
        }

        if(this.classroomObject.questions)
        {
          this.questions = this.classroomObject.questions;
        }
        console.log(this.questions);
     });
  }

  UpdateQuestionsView(numberOfQuestions: number){
    if(this.classroomObject.length != numberOfQuestions)
    {
      this.GetClassroomObject();
    }    
  }

  ReplyToQuestion(questionId: string, question: string){
    this.replyMode = true;
    this.replyQuestion = question;
    this.replyQuestionId = questionId;
  }

  SubmitReply(){
    const url = '/api/v1/classrooms/' + this.currentClassroomId + '/questions/' + this.replyQuestionId + '/answers'  
    this.replyMode = false;
    if(this.questionAnswer != ""){
      this.HTTP.post(url, {answer: this.questionAnswer})
      .subscribe((data) => {});
    }
  }

  getCSS(){
    var percentPanicked = this.numberPanic/this.studentCount;
    if(percentPanicked < 0.33)
    {
      return "green"
    }
    if(percentPanicked > 0.33 && percentPanicked < 0.66)
    {
      return "yellow"
    }
    if(percentPanicked > 0.66)
    {
      return "red"
    }
  }
}
