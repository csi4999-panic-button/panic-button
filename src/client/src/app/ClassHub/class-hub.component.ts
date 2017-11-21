import * as io from 'socket.io-client';
import { Component, OnInit, HostBinding } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';


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
  classroom: Classroom;
  panicStates: {[classroom: string]: boolean};
  panicNumbers: {[classroomId: string]: number};
  isPanic: boolean;
  studentCount: number;
  percentPanicked: number;
  newQuestion: string;
  isQuestionAsked: boolean;
  replyMode: boolean;
  replyQuestionId: string;
  replyQuestion: string;
  questionAnswers: QuestionAnswers = {};
  questionAnswer: string;
  courseInfo: string;
  currentTopic: string;
  firstTopic: boolean;
  lastTopic: boolean;

  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute) {
    this.HTTP = http;
    this.panicStates = {};
    this.panicNumbers = {};
    this.currentClassroomId = '';
    const url = '/api/v1/authenticate';
    this.isPanic = false;
    this.numberPanic = 0;
    this.percentPanicked = 0;
    this.isQuestionAsked = false;
    this.newQuestion = '';
    this.replyMode = false;
    this.classroom = {
      _id: '',
      courseNumber: '',
      courseTitle: '',
      role: '',
      courseType: '',
      sectionNumber: '',
      studentCount: -1,
      studentCode: '',
      teacherCode: '',
      questions: [] as [Question],
      students: [] as [string],
      teachers: [] as [string],
      teacherAssistants: [] as [string],
      topics: [] as [string],
      currentTopic: 0,
      schoolId: '',
      schoolName: ''
    };
    this.setTopicInfo('General', true, true);
    this.setClassInfo();

    this.route.queryParams.subscribe(params => {
      this.currentClassroomId = params['id'];
   });

    this.GetClassroomObject();

    http.post(url, {})
      .subscribe((data) => {
        this.token = data['token'];
        this.socket = io();
        this.socket.on('connect', () => {
          this.socket.emit('login', this.token);
        });

        // login
        this.socket.on('login_success', function(sucess: boolean) {
          console.log('connected', sucess);
        })
        // Panic Events
          .on('panic', (event) => {
            console.log(event);
            console.log('panic event');
            if (event.classroom === this.currentClassroomId) {
              this.panicNumbers[event.classroom] = event.panicNumber;
              this.UpdatePanicView();
            }
          })
          .on('panic_state_change', (event) => {
            this.panicStates[event.classroom] = event.state;
            console.log('state change');
            if (event.classroom === this.currentClassroomId) {
              this.UpdatePanicView();
            }
          })
          .on('refresh', (event) => {
            // set values
            console.log('refresh:', event);
            if (event.classroom === this.currentClassroomId) {
              this.UpdatePanicView();
            }
          })
          .on('new_question', (event) => {
            console.log('new_question:', event);
            console.log('Local number of questions:', this.classroom.questions.length);
            console.log('Event number of questions:', event.numberOfQuestions);
            if ((event.classroom === this.currentClassroomId) &&
                (this.classroom.questions.length !== event.numberOfQuestions)) {
              this.GetClassroomObject();
            }
          })
          .on('new_answer', (event) => {
            console.log('new_answer', event);
            if (event.classroom === this.currentClassroomId) {
              this.GetClassroomObject();
            }
          })
          .on('topic_change', (event) => {
            console.log('topic_change', event);
            if (event.classroom === this.currentClassroomId) {
              console.log('Changing topic to', event.topic);
              this.setTopicInfo(event.topic, event.first, event.last);
            }
          });
      });
  }

  Panic() {
    this.socket.emit('panic', { classroom: this.currentClassroomId, state: !this.panicStates[this.currentClassroomId] });
    console.log('button hit');
  }

  NewQuestion() {
    const url = `/api/v1/classrooms/${this.currentClassroomId}/questions`;
    if (!this.isQuestionAsked && this.newQuestion !== '') {
      this.HTTP.post(url, {question: this.newQuestion})
        .subscribe((data) => { });
      this.isQuestionAsked = !this.isQuestionAsked;
      this.newQuestion = '';
    } else {
      this.isQuestionAsked = !this.isQuestionAsked;
      this.newQuestion = '';
    }
  }

  UpdatePanicView() {
    this.isPanic = this.panicStates[this.currentClassroomId];
    this.numberPanic = this.panicNumbers[this.currentClassroomId];
    this.percentPanicked = Math.round(this.numberPanic * 100/ this.studentCount);
  }

  GetClassroomObject() {
    this.HTTP.get<Classroom>(`/api/v1/classrooms/${this.currentClassroomId}`)
    .subscribe((classroom) => {
        this.classroom = classroom;
        console.log('classroom', this.classroom);
        this.classroom.studentCount = this.classroom.students.length;
        this.studentCount = this.classroom.students.length;
        console.log(this.classroom.questions);
        this.setClassInfo();
        this.setTopicInfo(this.classroom.topics[this.classroom.currentTopic],
          this.classroom.currentTopic === 0,
          this.classroom.currentTopic === (this.classroom.topics.length - 1));
     });
  }

  UpdateQuestionsView(numberOfQuestions: number) {
    if (this.classroom.questions.length !== numberOfQuestions) {
      this.GetClassroomObject();
    }
  }

  ReplyToQuestion(questionId: string) {
    const url = '/api/v1/classrooms/' + this.currentClassroomId + '/questions/' + questionId +'/answers';
    console.log(url);
    console.log(this.questionAnswers);
    if (this.questionAnswers[questionId] !== '') {
      this.HTTP.post(url, {answer: this.questionAnswers[questionId]})
      .subscribe((data) => { this.questionAnswers[questionId] = ''; });
    }
  }

  ReplyToAnswer(): void {
    const url = `/api/v1/classrooms/${this.currentClassroomId}/questions/${this.replyQuestionId}/answers`;
    this.replyMode = false;
    if (this.questionAnswer !== '') {
      this.HTTP.post(url, {answer: this.questionAnswer})
      .subscribe((data) => { this.questionAnswer = ''; });
    }
  }

  VoteForQuestion(question: Question) {
    console.log(question);
    const url = `/api/v1/classrooms/${this.currentClassroomId}/questions/${question._id}`;
    this.HTTP.put<SuccessResponse>(url, { up: true })
      .subscribe((response) => { console.log('Voted'); });
  }

  VoteForAnswer(question: Question, answer: Answer) {
    console.log(question);
    console.log(answer);
    const url = `/api/v1/classrooms/${this.currentClassroomId}/questions/${question._id}/answers/${answer._id}`;
    this.HTTP.put<SuccessResponse>(url, { up: true })
      .subscribe((response) => { console.log('Voted'); });
  }

  NextTopic(): void {
    this.socket.emit('topic_change', {
      classroom: this.currentClassroomId,
      next: true,
      previous: false,
    });
  }

  PreviousTopic(): void {
    this.socket.emit('topic_change', {
      classroom: this.currentClassroomId,
      next: false,
      previous: true,
    });
  }

  getCSS() {
    const percentPanicked = this.numberPanic / this.classroom.students.length;
    if (percentPanicked < 0.33) {
      return 'green';
    } else if (percentPanicked > 0.33 && percentPanicked < 0.66) {
      return 'yellow';
    } else if (percentPanicked > 0.66) {
      return 'red';
    }
  }

  setClassInfo(): void {
    // based on {{classroom.courseNumber}} - {{classroom.courseTitle}}
    if (this.classroom.courseType && this.classroom.courseNumber) {
        this.courseInfo = `${this.classroom.courseType} ${this.classroom.courseNumber}`;
    } else {
      this.courseInfo = '';
    }
  }

  setTopicInfo(topic: string, first: boolean, last: boolean): void {
    if (topic.length > 48) {
      this.currentTopic = `${topic.slice(0, 44)}...`;
    } else {
      this.currentTopic = topic;
    }
    this.firstTopic = first;
    this.lastTopic = last;
  }

}

export interface Classroom {
  _id: string;
  courseNumber: string;
  courseTitle: string;
  role: string;
  courseType: string;
  sectionNumber: string;
  studentCount: number;
  studentCode: string;
  teacherCode: string;
  questions: [Question];
  students: [string];
  teachers: [string];
  teacherAssistants: [string];
  topics: [string];
  currentTopic: number;
  schoolId: string;
  schoolName: string;
}

export interface QuestionAnswers {
  [_id: string]: string;
}

export interface Question {
  _id: string;
  question: string;
  ts: number;
  answers: [Answer];
  votes: [string];
  resolution: number;
  mine: boolean;
  isTeacher: boolean;
}

export interface Answer {
  _id: string;
  answer: string;
  votes: [string];
  ts: number;
  mine: boolean;
  isTeacher: boolean;
}

export interface SuccessResponse {
  success: boolean;
}
