// src/app/components/dashboard/dashboard.ts
import { Component } from '@angular/core';
import { ApiService } from '../../services/api';
import { JsonPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  data:any;

  constructor(private api:ApiService){}

  loadUsers(){ this.api.getUsers().subscribe(r=>this.data=r); }
  loadMentors(){ this.api.getMentors().subscribe(r=>this.data=r); }
  loadSkills(){ this.api.getSkills().subscribe(r=>this.data=r); }
  loadGroups(){ this.api.getGroups().subscribe(r=>this.data=r); }
}