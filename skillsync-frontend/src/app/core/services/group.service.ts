import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MemberDto {
  email: string;
  role: string;
}

export interface GroupResponse {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  members: MemberDto[];
}

export interface CreateGroupRequest {
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:7070/group-service/groups';

  getAllGroups(): Observable<GroupResponse[]> {
    return this.http.get<GroupResponse[]>(this.apiUrl);
  }

  getMyGroups(): Observable<GroupResponse[]> {
    return this.http.get<GroupResponse[]>(`${this.apiUrl}/my`);
  }

  createGroup(request: CreateGroupRequest): Observable<GroupResponse> {
    return this.http.post<GroupResponse>(this.apiUrl, request);
  }

  joinGroup(groupId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${groupId}/join`, {}, { responseType: 'text' as 'json' });
  }

  leaveGroup(groupId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/${groupId}/leave`, {}, { responseType: 'text' as 'json' });
  }

  deleteGroup(groupId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${groupId}`, { responseType: 'text' as 'json' });
  }

  getGroupById(groupId: number): Observable<GroupResponse> {
    return this.http.get<GroupResponse>(`${this.apiUrl}/${groupId}`);
  }
}
