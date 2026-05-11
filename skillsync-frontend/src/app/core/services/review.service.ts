import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface ReviewResponse {
  id: number;
  mentorId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewRequest {
  mentorId: number;
  userId: number;
  rating: number;
  comment: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/review-service/reviews`;

  getReviewsByMentor(mentorId: number): Observable<ApiResponse<ReviewResponse[]>> {
    return this.http.get<ApiResponse<ReviewResponse[]>>(`${this.apiUrl}/mentor/${mentorId}`);
  }

  addReview(request: ReviewRequest): Observable<ApiResponse<ReviewResponse>> {
    return this.http.post<ApiResponse<ReviewResponse>>(this.apiUrl, request);
  }

  deleteReview(reviewId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${reviewId}`);
  }
}
