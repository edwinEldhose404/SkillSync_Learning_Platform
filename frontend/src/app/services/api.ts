import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  token() {
    return localStorage.getItem('token');
  }

  headers() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token()}`
      })
    };
  }

  login(data:any){
    return this.http.post(this.base + '/api/auth/login', data);
  }

  register(data:any){
    return this.http.post(this.base + '/api/auth/register', data);
  }

  getUsers(){
    return this.http.get(this.base + '/users', this.headers());
  }

  getMentors(){
    return this.http.get(this.base + '/mentors/public');
  }

  getSkills(){
    return this.http.get(this.base + '/skills');
  }

  getGroups(){
    return this.http.get(this.base + '/groups', this.headers());
  }
}