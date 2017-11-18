import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.html',
  styleUrls: ['./app.component.css']
})
export class HomePageComponent {
  constructor(private router: Router){}

  navigateTo(link: any){
    this.router.navigate([link]);
  }
 }