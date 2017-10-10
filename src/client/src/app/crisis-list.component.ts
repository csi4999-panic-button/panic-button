import { Component } from '@angular/core';

@Component({
  template: `
    <h2>CRISIS</h2>
    <p>Get your heroes here</p>

    <button routerLink="/sidekicks">Go to sidekicks</button>
  `
})
export class CrisisListComponent { }