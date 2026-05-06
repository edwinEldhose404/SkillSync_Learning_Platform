import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SkillsComponent } from './features/skills/skills.component';
import { MentorsComponent } from './features/mentors/mentors.component';
import { MentorApplyComponent } from './features/mentors/apply/mentor-apply.component';
import { GroupsComponent } from './features/groups/groups.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { SessionsComponent } from './features/sessions/sessions.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'skills', component: SkillsComponent },
  { path: 'mentors', component: MentorsComponent },
  { path: 'mentors/apply', component: MentorApplyComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'sessions', component: SessionsComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
