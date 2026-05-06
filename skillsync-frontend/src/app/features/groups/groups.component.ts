import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GroupService, GroupResponse, CreateGroupRequest } from '../../core/services/group.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="groups-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="nav-back" routerLink="/dashboard">
            <i class="fas fa-arrow-left"></i> Back to Dashboard
          </div>
          <h1 class="glow-text">Study Groups</h1>
          <p class="subtitle">Collaborate, learn, and grow with peers</p>
        </div>
        <button class="create-btn" *ngIf="canCreateGroup" (click)="showCreateForm = !showCreateForm">
          <i class="fas" [class.fa-plus]="!showCreateForm" [class.fa-times]="showCreateForm"></i>
          {{ showCreateForm ? 'Cancel' : 'Create Group' }}
        </button>
      </div>

      <!-- Global Error Banner -->
      <div class="error-msg-banner" *ngIf="errorMessage" style="margin-bottom: 20px;">
        {{ errorMessage }}
      </div>

      <!-- Create Group Form -->
      <div class="glass-card create-form-card" *ngIf="showCreateForm">
        <h3>Create New Group</h3>
        
        <div class="form-group">
          <label>Group Name</label>
          <input type="text" [(ngModel)]="newGroup.name" placeholder="Enter group name...">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="newGroup.description" placeholder="What is this group about?"></textarea>
        </div>
        <div class="form-actions">
          <button class="submit-btn" (click)="createGroup()" [disabled]="!newGroup.name">
            Initialize Group
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <button class="tab-btn" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">
          All Communities
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'my'" (click)="activeTab = 'my'">
          My Groups
        </button>
      </div>

      <!-- Groups Grid -->
      <div class="groups-grid">
        <div class="glass-card group-card" *ngFor="let group of filteredGroups">
          <div class="group-badge">Community</div>
          <div class="group-info">
            <h3>{{ group.name }}</h3>
            <p class="creator">Created by: <span>{{ formatCreator(group.createdBy) }}</span></p>
            <p class="description">{{ group.description }}</p>
            
            <!-- Member List Reveal (for Admins) -->
            <div class="members-reveal" *ngIf="expandedGroupId === group.id">
              <h4 class="member-list-title">Current Members:</h4>
              <ul class="member-list">
                <li *ngFor="let m of group.members">
                  <i class="fas fa-user-circle"></i> {{ m.email }} <span class="role-badge">{{ m.role }}</span>
                </li>
              </ul>
            </div>
            
            <div class="stats">
              <div class="stat">
                <i class="fas fa-users"></i>
                <span>{{ group.members.length || 0 }} members</span>
              </div>
            </div>
          </div>

          <div class="group-actions">
            <!-- Join/Leave for Users and Mentors -->
            <button *ngIf="canJoinLeave && !isMember(group)" class="join-btn" (click)="joinGroup(group.id)">
              Join Group
            </button>
            <button *ngIf="canJoinLeave && isMember(group) && !isAdminOfGroup(group)" class="leave-btn" (click)="leaveGroup(group.id)">
              Leave
            </button>
            
            <!-- See Group for Admins -->
            <button *ngIf="currentUserRole === 'ADMIN'" class="see-btn" (click)="toggleGroupDetails(group.id)">
              <i class="fas fa-eye"></i> {{ expandedGroupId === group.id ? 'Hide Details' : 'See Group' }}
            </button>

            <!-- Delete for Admins and Owners (Anyone who is the ADMIN of the group) -->
            <button *ngIf="currentUserRole === 'ADMIN' || isAdminOfGroup(group)" class="delete-btn" (click)="deleteGroup(group.id)">
              Delete
            </button>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredGroups.length === 0">
          <i class="fas fa-users-slash"></i>
          <p>No groups found in this category.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .groups-container {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.8s ease-out;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }

    .nav-back {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary-color);
      cursor: pointer;
      margin-bottom: 15px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .nav-back:hover {
      transform: translateX(-5px);
      color: var(--primary-hover);
    }

    .glow-text {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
      font-weight: 800;
    }

    .subtitle {
      color: var(--text-muted);
      margin-top: 8px;
    }

    .create-btn {
      padding: 12px 24px;
      background: var(--primary-gradient);
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    .create-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
    }

    .glass-card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 25px;
      transition: all 0.3s ease;
    }

    .error-msg-banner {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #ef4444;
      color: #ef4444;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      animation: shake 0.4s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .create-form-card {
      margin-bottom: 30px;
      border-color: rgba(99, 102, 241, 0.3);
      animation: slideDown 0.4s ease-out;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      color: var(--text-muted);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-group input, .form-group textarea {
      width: 100%;
      padding: 12px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: white;
      font-family: inherit;
    }

    .form-group textarea {
      height: 100px;
      resize: vertical;
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      background: var(--primary-color);
      border: none;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .tabs-container {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 15px;
    }

    .tab-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .tab-btn.active {
      color: white;
      background: rgba(99, 102, 241, 0.1);
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
    }

    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
    }

    .group-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .group-card:hover {
      transform: translateY(-5px);
      border-color: var(--primary-color);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .group-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      padding: 4px 12px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 20px;
      color: #818cf8;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .group-info h3 {
      margin: 0 0 10px 0;
      font-size: 1.25rem;
      color: white;
    }

    .creator {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 15px;
    }

    .creator span {
      color: #818cf8;
    }

    .description {
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      display: flex;
      gap: 20px;
      margin-bottom: 25px;
      padding-top: 15px;
      border-top: 1px solid var(--border-color);
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 13px;
    }

    .stat i {
      color: var(--primary-color);
    }

    .group-actions {
      display: flex;
      gap: 10px;
    }

    .join-btn, .leave-btn {
      flex: 1;
      padding: 10px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .join-btn {
      background: var(--primary-color);
      border: none;
      color: white;
    }

    .leave-btn {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .leave-btn:hover {
      background: #ef4444;
      color: white;
    }
    .see-btn {
      flex: 1;
      padding: 10px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.5);
      color: #818cf8;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .see-btn:hover {
      background: rgba(99, 102, 241, 0.2);
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    }
    .members-reveal {
      margin: 15px 0;
      padding: 15px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border-left: 3px solid var(--primary-color);
      animation: slideIn 0.3s ease-out;
    }
    .member-list-title {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .member-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .member-list li {
      font-size: 13px;
      color: white;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .role-badge {
      font-size: 10px;
      padding: 2px 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: var(--text-muted);
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .delete-btn {
      padding: 10px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.5);
      color: #ef4444;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .delete-btn:hover {
      background: #ef4444;
      color: white;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 100px 0;
      color: var(--text-muted);
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 20px;
      opacity: 0.2;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class GroupsComponent implements OnInit {
  private groupService = inject(GroupService);
  private authService = inject(AuthService);

  allGroups: GroupResponse[] = [];
  myGroups: GroupResponse[] = [];
  activeTab: 'all' | 'my' = 'all';
  showCreateForm = false;
  expandedGroupId: number | null = null;
  
  newGroup: CreateGroupRequest = {
    name: '',
    description: ''
  };

  currentUserEmail = '';
  currentUserRole = '';
  errorMessage = '';

  ngOnInit() {
    this.currentUserEmail = this.authService.getEmailFromToken() || '';
    this.currentUserRole = this.getUserRoleFromToken() || '';
    this.loadGroups();
  }

  getUserRoleFromToken(): string | null {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  }

  get canCreateGroup(): boolean {
    return this.currentUserRole === 'ADMIN' || this.currentUserRole === 'MENTOR';
  }

  get canJoinLeave(): boolean {
    return this.currentUserRole === 'USER' || this.currentUserRole === 'MENTOR';
  }

  toggleGroupDetails(groupId: number) {
    this.expandedGroupId = this.expandedGroupId === groupId ? null : groupId;
  }

  loadGroups() {
    this.groupService.getAllGroups().subscribe({
      next: (groups) => this.allGroups = groups,
      error: (err) => console.error('Failed to load groups', err)
    });

    this.groupService.getMyGroups().subscribe({
      next: (groups) => this.myGroups = groups,
      error: (err) => console.error('Failed to load my groups', err)
    });
  }

  get filteredGroups() {
    const list = this.activeTab === 'all' ? this.allGroups : this.myGroups;
    // Only show groups that have both a name and a creator
    return list.filter(g => g.name && g.createdBy);
  }

  isMember(group: GroupResponse): boolean {
    const userEmail = this.currentUserEmail?.toLowerCase().trim();
    return group.members?.some(m => m.email?.toLowerCase().trim() === userEmail) || false;
  }

  isAdminOfGroup(group: GroupResponse): boolean {
    if (!group.createdBy || !this.currentUserEmail) {
      return false;
    }
    
    const owner = group.createdBy.toLowerCase().trim();
    const user = this.currentUserEmail.toLowerCase().trim();
    
    return owner === user;
  }

  createGroup() {
    this.errorMessage = '';
    this.groupService.createGroup(this.newGroup).subscribe({
      next: () => {
        this.loadGroups();
        this.showCreateForm = false;
        this.newGroup = { name: '', description: '' };
      },
      error: (err) => {
        console.error('Create error:', err);
        let msg = 'Server error';
        if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            msg = parsed.message || msg;
          } catch(e) {}
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        this.errorMessage = 'Creation failed: ' + msg;
      }
    });
  }

  joinGroup(groupId: number) {
    this.errorMessage = '';
    this.groupService.joinGroup(groupId).subscribe({
      next: () => this.loadGroups(),
      error: (err) => {
        console.error('Join error:', err);
        let msg = 'Check connection';
        if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            msg = parsed.message || msg;
          } catch(e) {}
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        this.errorMessage = 'Join failed: ' + msg;
      }
    });
  }

  leaveGroup(groupId: number) {
    this.errorMessage = '';
    this.groupService.leaveGroup(groupId).subscribe({
      next: () => this.loadGroups(),
      error: (err) => {
        console.error('Leave error:', err);
        let msg = 'Action restricted';
        
        // Handle stringified JSON error bodies
        if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            msg = parsed.message || msg;
          } catch(e) {
            msg = err.error;
          }
        } else if (err.error?.message) {
          msg = err.error.message;
        }
        
        this.errorMessage = 'Leave failed: ' + msg;
        console.error('Leave Error Details:', msg);
      }
    });
  }

  deleteGroup(groupId: number) {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    
    this.errorMessage = '';
    this.groupService.deleteGroup(groupId).subscribe({
      next: () => this.loadGroups(),
      error: (err) => {
        console.error('Delete error:', err);
        let msg = 'Delete failed';
        if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            msg = parsed.message || msg;
          } catch(e) {}
        }
        this.errorMessage = 'Delete failed: ' + msg;
      }
    });
  }

  formatCreator(email: string | undefined): string {
    if (!email) return 'user#000';
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash) + email.charCodeAt(i);
      hash |= 0; 
    }
    const id = Math.abs(hash % 1000);
    return `user#${id.toString().padStart(3, '0')}`;
  }
}
