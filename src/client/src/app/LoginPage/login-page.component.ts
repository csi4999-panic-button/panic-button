import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'login-page',
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css'],
})

export class LoginPageComponent{
  protected userData: any;
  userName: string;
  password: string;
  protected HTTP: HttpClient
  protected body: any;
  flag: boolean;
  link: string;
  badLogin: boolean;

  constructor(private http: HttpClient) {
    this.HTTP = http;
    
 }
 
 
 TryLogin(){
   const url = '/login';
   if(this.userName != null && this.password != null){
    this.HTTP.post(url, {email:this.userName, password:this.password})
    .subscribe((data) => {     
        this.flag = data['success'];
        console.log(this.flag);
     });
     return this.flag;
   }
 }

 BadLogin(thrownflag: boolean)
 {
   if(thrownflag)
   {
     this.badLogin = true;
   }
   else
   {
     this.badLogin = false;
   }
 }

 GetLink()
 {
   if(this.TryLogin() == true)
   {
     this.link = '/user-console'
   }
   else
   {
     this.link= 'login-page'
   }
//    if(this.TryLogin())
//    {
//      return '/user-console'
//    }
//    else
//    {
//      return 
//    }
  }
 
}