import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface MentorResponse {
  id: number;
  userId: number;
  bio: string;
  experience: number;
  rating: number;
  hourlyRate: number;
  skills: string[];
  status: string;
}

export interface MentorRequest {
  userId: number;
  bio: string;
  experience: number;
  hourlyRate: number;
  skillIds: number[];
  email?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/mentor-service/mentors`;

  getMentorById(id: number): Observable<ApiResponse<MentorResponse>> {
    return this.http.get<ApiResponse<MentorResponse>>(`${this.apiUrl}/${id}`);
  }

  getMentorsByStatus(status: string): Observable<ApiResponse<MentorResponse[]>> {
    return this.http.get<ApiResponse<MentorResponse[]>>(`${this.apiUrl}/admin/status/${status}`);
  }

  approveMentor(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/admin/${id}`, {});
  }

  getAllMentors(): Observable<ApiResponse<MentorResponse[]>> {
    return this.http.get<ApiResponse<MentorResponse[]>>(`${this.apiUrl}/public`);
  }

  applyToBeMentor(request: MentorRequest): Observable<ApiResponse<MentorResponse>> {
    return this.http.post<ApiResponse<MentorResponse>>(`${this.apiUrl}/apply`, request);
  }

  getMentorByUserId(userId: number): Observable<ApiResponse<MentorResponse>> {
    return this.http.get<ApiResponse<MentorResponse>>(`${this.apiUrl}/user/${userId}`);
  }
}
