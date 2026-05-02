import { Component } from '@angular/core';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent, DashboardComponent, NgIf],
  templateUrl: './app.html'
})
export class AppComponent {
  token = localStorage.getItem('token');

  logout(){
    localStorage.removeItem('token');
    location.reload();
  }
}