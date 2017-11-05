import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'login-page',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
})

export class LoginPageComponent{
  protected userData: any;
  protected userName: string;
  protected password: any;
  protected body: any;

  constructor(private http: HttpClient) {
    const url = 'http://www.panic-button.stream/login';
    http.post(url, {email:"dandyla@oakland.edu", password:"testpass"})
    .subscribe();
  }
 }