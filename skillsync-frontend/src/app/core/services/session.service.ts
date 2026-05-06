import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Session {
  id: number;
  mentor_id: number;
  learner_id: number;
  session_Date: Date | string;
  status: string;
  created_at: Date | string;
}

export interface SessionDTO {
  mentor_id: number;
  learner_id: number;
  session_Date: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:7070/session-service/sessions';

  requestSession(dto: SessionDTO): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, dto);
  }

  bookSession(dto: SessionDTO): Observable<Session> {
    return this.http.post<Session>(`${this.apiUrl}/book`, dto);
  }

  acceptSession(id: number): Observable<Session> {
    return this.http.put<Session>(`${this.apiUrl}/${id}/accept`, {});
  }

  rejectSession(id: number): Observable<Session> {
    return this.http.put<Session>(`${this.apiUrl}/${id}/reject`, {});
  }

  cancelSession(id: number): Observable<Session> {
    return this.http.put<Session>(`${this.apiUrl}/${id}/cancel`, {});
  }

  completeSession(id: number): Observable<Session> {
    return this.http.put<Session>(`${this.apiUrl}/${id}/complete`, {});
  }

  getSessionsByUser(userId: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/user/${userId}`);
  }

  getMySessions(userId: number): Observable<Session[]> {
    return this.http.get<Session[]>(`${this.apiUrl}/my/${userId}`);
  }

  getSessionById(id: number): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }
}
