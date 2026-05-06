import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/authentication-service/api/auth`;

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/user-service/users/me`);
  }

  createProfile(profileData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/user-service/users/profile`, profileData);
  }

  getEmailFromToken(): string | null {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  getUserIdFromToken(): number | null {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ? parseInt(payload.userId, 10) : null;
    } catch {
      return null;
    }
  }

  getRoleFromToken(): string {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return 'USER';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'USER';
    } catch {
      return 'USER';
    }
  }
}
