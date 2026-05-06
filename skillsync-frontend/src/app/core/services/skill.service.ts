import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Skill {
  id?: number;
  name: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/skill-service/skills`;

  getAllPublicSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.apiUrl}/public`);
  }

  createSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(this.apiUrl, skill);
  }
}
