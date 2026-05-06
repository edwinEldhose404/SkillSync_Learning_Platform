import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SessionService, Session } from '../../core/services/session.service';
import { AuthService } from '../../core/services/auth.service';
import { MentorService, MentorResponse, ApiResponse } from '../../core/services/mentor.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="sessions-container">
      <div class="header-section">
        <div class="header-content">
          <div class="nav-back" routerLink="/dashboard">
            <i class="fas fa-arrow-left"></i> Back to Dashboard
          </div>
          <h1 class="glow-text">My Learning Sessions</h1>
          <p class="subtitle">Manage your mentoring and learning schedules</p>
        </div>
      </div>

      <!-- Error Banner -->
      <div class="error-msg-banner" *ngIf="errorMessage">
        <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
      </div>

      <!-- Success Banner -->
      <div class="success-msg-banner" *ngIf="successMessage">
        <i class="fas fa-check-circle"></i> {{ successMessage }}
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <button class="tab-btn" [class.active]="activeTab === 'all'" (click)="activeTab = 'all'">
          All Sessions
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'pending'" (click)="activeTab = 'pending'">
          Pending
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'active'" (click)="activeTab = 'active'">
          Active
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'completed'" (click)="activeTab = 'completed'">
          Completed
        </button>
      </div>

      <!-- Sessions Grid -->
      <div class="sessions-grid">
        <div class="glass-card session-card" *ngFor="let session of filteredSessions">
          <div class="session-badge" [ngClass]="getStatusClass(session.status)">
            {{ session.status }}
          </div>
          
          <div class="session-info">
            <h3>Session #{{ session.id }}</h3>
            
            <div class="users-involved">
              <div class="user-pill" [class.highlight]="session.mentor_id === mentorId">
                <i class="fas fa-chalkboard-teacher"></i>
                <span>Mentor: User #{{ session.mentor_id }}</span>
              </div>
              <div class="user-pill" [class.highlight]="session.learner_id === currentUserId">
                <i class="fas fa-user-graduate"></i>
                <span>Learner: User #{{ session.learner_id }}</span>
              </div>
            </div>

            <div class="session-date">
              <i class="far fa-calendar-alt"></i>
              <span>{{ session.session_Date | date:'medium' }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="session-actions">
            <!-- Mentor Actions -->
            <ng-container *ngIf="mentorId && session.mentor_id === mentorId">
              <button *ngIf="session.status === 'PENDING' || session.status === 'REQUESTED' || session.status === 'BOOKED'" class="action-btn accept" (click)="acceptSession(session.id)">
                <i class="fas fa-check"></i> Accept
              </button>
              <button *ngIf="session.status === 'PENDING' || session.status === 'REQUESTED' || session.status === 'BOOKED'" class="action-btn reject" (click)="rejectSession(session.id)">
                <i class="fas fa-times"></i> Reject
              </button>
              <button *ngIf="session.status === 'ACCEPTED' || session.status === 'ACTIVE'" class="action-btn complete" (click)="completeSession(session.id)">
                <i class="fas fa-flag-checkered"></i> Complete
              </button>
              <button *ngIf="session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && session.status !== 'REJECTED'" class="action-btn cancel" (click)="cancelSession(session.id)">
                <i class="fas fa-ban"></i> Cancel
              </button>
            </ng-container>

            <!-- Learner Actions (None currently per API, but can display status text) -->
            <ng-container *ngIf="session.learner_id === currentUserId">
              <div class="learner-status-text">
                <span *ngIf="session.status === 'PENDING' || session.status === 'REQUESTED' || session.status === 'BOOKED'">Awaiting Mentor Approval</span>
                <span *ngIf="session.status === 'ACCEPTED'">Ready for Session</span>
                <span *ngIf="session.status === 'COMPLETED'">Session Completed</span>
              </div>
            </ng-container>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredSessions.length === 0">
          <i class="fas fa-calendar-times"></i>
          <p>No sessions found in this category.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sessions-container {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.8s ease-out;
    }

    .header-section {
      margin-bottom: 40px;
    }

    .nav-back {
      display: inline-flex;
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

    .glass-card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 25px;
      transition: all 0.3s ease;
    }

    .error-msg-banner, .success-msg-banner {
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 25px;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideDown 0.4s ease-out;
    }

    .error-msg-banner {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #ef4444;
      color: #ef4444;
    }

    .success-msg-banner {
      background: rgba(16, 185, 129, 0.1);
      border-left: 4px solid #10b981;
      color: #10b981;
    }

    .tabs-container {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 15px;
      overflow-x: auto;
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
      white-space: nowrap;
    }

    .tab-btn.active {
      color: white;
      background: rgba(99, 102, 241, 0.1);
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
    }

    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }

    .session-card {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .session-card:hover {
      transform: translateY(-5px);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .session-badge {
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fcd34d;
    }

    .status-active {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #93c5fd;
    }

    .status-completed {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }

    .status-cancelled {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .session-info h3 {
      margin: 0 0 20px 0;
      font-size: 1.4rem;
      color: white;
    }

    .users-involved {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(0, 0, 0, 0.2);
      padding: 12px;
      border-radius: 12px;
      color: var(--text-muted);
      font-size: 14px;
      border: 1px solid transparent;
      transition: all 0.3s ease;
    }

    .user-pill i {
      font-size: 18px;
      color: #818cf8;
      width: 24px;
      text-align: center;
    }

    .user-pill.highlight {
      border-color: rgba(99, 102, 241, 0.3);
      background: rgba(99, 102, 241, 0.05);
      color: white;
    }

    .session-date {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.1);
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .session-actions {
      margin-top: auto;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }

    .action-btn {
      flex: 1;
      min-width: 100px;
      padding: 10px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
      border: none;
    }

    .action-btn.accept {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .action-btn.accept:hover { background: rgba(16, 185, 129, 0.3); }

    .action-btn.complete {
      background: var(--primary-gradient);
      color: white;
    }
    .action-btn.complete:hover { box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); transform: translateY(-2px); }

    .action-btn.reject, .action-btn.cancel {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .action-btn.reject:hover, .action-btn.cancel:hover { background: rgba(239, 68, 68, 0.2); }

    .learner-status-text {
      width: 100%;
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
      font-style: italic;
      padding: 10px 0;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 80px 0;
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
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SessionsComponent implements OnInit {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);

  sessions: Session[] = [];
  activeTab: 'all' | 'pending' | 'active' | 'completed' = 'all';
  
  currentUserId: number | null = null;
  mentorId: number | null = null;
  currentUserRole = '';
  errorMessage = '';
  successMessage = '';

  ngOnInit() {
    this.currentUserRole = this.getUserRoleFromToken() || '';
    this.loadCurrentUser();
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

  private mentorService = inject(MentorService);

  loadCurrentUser() {
    this.authService.getMyProfile().subscribe({
      next: (res) => {
        const apiUserId = res?.userId ?? res?.user_id ?? res?.id;
        if (apiUserId) {
          this.currentUserId = Number(apiUserId);
          
          // Always attempt to fetch Mentor ID to account for stale tokens
          this.mentorService.getMentorByUserId(this.currentUserId).subscribe({
            next: (mRes: ApiResponse<MentorResponse>) => {
              this.mentorId = mRes.data?.id || null;
              if (this.mentorId) {
                console.log('[SkillSync] Resolved Mentor ID:', this.mentorId, 'for User:', this.currentUserId);
              }
              this.loadSessions();
            },
            error: () => {
              // Not a mentor, just load sessions as a regular user
              this.loadSessions();
            }
          });
        } else {
          this.showError('Could not identify user profile. Please update your profile.');
        }
      },
      error: () => {
        this.showError('Could not load user profile. Please ensure you have set up a profile.');
      }
    });
  }

  loadSessions() {
    if (!this.currentUserId) return;
    
    // Using user endpoints depending on backend design. getSessionsByUser fetches all related.
    this.sessionService.getSessionsByUser(this.currentUserId).subscribe({
      next: (data) => {
        this.sessions = data;
        if (this.sessions.length === 0) {
           console.log('[SkillSync] No sessions found for user ID:', this.currentUserId);
        }
      },
      error: (err) => {
        console.error('Failed to load sessions', err);
        this.showError('Could not load sessions. Make sure the session-service is running.');
      }
    });
  }

  get filteredSessions() {
    return this.sessions.filter(s => {
      if (this.activeTab === 'all') return true;
      if (this.activeTab === 'pending') return s.status === 'PENDING' || s.status === 'REQUESTED' || s.status === 'BOOKED';
      // Mapped states based on standard conventions
      if (this.activeTab === 'active') return s.status === 'ACCEPTED' || s.status === 'ACTIVE';
      if (this.activeTab === 'completed') return s.status === 'COMPLETED';
      return true;
    }).sort((a, b) => {
      // Sort by newest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
      case 'REQUESTED':
      case 'BOOKED': return 'status-pending';
      case 'ACCEPTED':
      case 'ACTIVE': return 'status-active';
      case 'COMPLETED': return 'status-completed';
      case 'REJECTED':
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  acceptSession(id: number) {
    this.sessionService.acceptSession(id).subscribe({
      next: () => {
        this.showSuccess('Session accepted successfully');
        this.loadSessions();
      },
      error: (err) => this.handleError(err, 'Accept failed')
    });
  }

  rejectSession(id: number) {
    this.sessionService.rejectSession(id).subscribe({
      next: () => {
        this.showSuccess('Session rejected');
        this.loadSessions();
      },
      error: (err) => this.handleError(err, 'Reject failed')
    });
  }

  cancelSession(id: number) {
    if (!confirm('Are you sure you want to cancel this session?')) return;
    this.sessionService.cancelSession(id).subscribe({
      next: () => {
        this.showSuccess('Session cancelled');
        this.loadSessions();
      },
      error: (err) => this.handleError(err, 'Cancel failed')
    });
  }

  completeSession(id: number) {
    this.sessionService.completeSession(id).subscribe({
      next: () => {
        this.showSuccess('Session marked as completed');
        this.loadSessions();
      },
      error: (err) => this.handleError(err, 'Completion failed')
    });
  }

  private showSuccess(msg: string) {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 4000);
  }

  private showError(msg: string) {
    this.errorMessage = msg;
    this.successMessage = '';
  }

  private handleError(err: any, fallback: string) {
    console.error(fallback, err);
    let msg = fallback;
    if (err.error?.message) {
      msg = err.error.message;
    } else if (typeof err.error === 'string') {
      try {
        const parsed = JSON.parse(err.error);
        msg = parsed.message || msg;
      } catch (e) {
        msg = err.error;
      }
    }
    this.showError(msg);
  }
}
