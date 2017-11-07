import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';

@Component({
  selector: 'sign-up',
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css']
})
export class SignUpComponent {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  flag: any;
  registrationSuccess: boolean;
  private HTTP: HttpClient;
  
  constructor(private http: HttpClient){
    this.HTTP = http;
  }

  CheckForNulls()
  {
    if(this.email == null)
    {
      this.email = ""
    }
    if(this.password == null)
    {
      this.password = ""
    }
    if(this.firstName == null)
    {
      this.firstName = ""
    }
    if(this.lastName == null)
    {
      this.lastName = ""
    }
  }

  Register(){
    const url = '/register';
    if(this.email != null && this.password != null){
      this.CheckForNulls();
     this.HTTP.post(url, {email:this.email, password:this.password, firstName: this.firstName, lastName: this.lastName})
     .subscribe((data) => {     
          this.flag = data['createdAt'];
          console.log(this.flag);
      });
      this.registrationSuccess = true; 
    }
    
  }
 }