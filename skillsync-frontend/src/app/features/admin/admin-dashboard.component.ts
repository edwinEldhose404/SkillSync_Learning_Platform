import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MentorService, MentorResponse } from '../../core/services/mentor.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <div class="nav-back" routerLink="/dashboard">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </div>
        <h1 class="glow-text">Admin Control Center</h1>
        <p class="subtitle">Review and manage mentor applications</p>
      </div>

      <div class="stats-overview">
        <div class="glass-card stat-card" (click)="loadMentorsByStatus('PENDING')" [class.active]="currentFilter === 'PENDING'">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="glass-card stat-card" (click)="loadMentorsByStatus('APPROVED')" [class.active]="currentFilter === 'APPROVED'">
          <span class="stat-value">{{ approvedCount }}</span>
          <span class="stat-label">Approved</span>
        </div>
        <div class="glass-card stat-card" (click)="loadMentorsByStatus('REJECTED')" [class.active]="currentFilter === 'REJECTED'">
          <span class="stat-value">{{ rejectedCount }}</span>
          <span class="stat-label">Rejected</span>
        </div>
      </div>
      
      <div class="error-banner" *ngIf="errorMessage" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(239, 68, 68, 0.2); text-align: center;">
        <i class="fas fa-exclamation-triangle"></i> {{ errorMessage }}
      </div>

      <div class="applications-section">
        <h2 class="section-title">Mentor Applications ({{ currentFilter }})</h2>
        
        <div *ngIf="isLoading" class="loading-overlay" style="text-align: center; padding: 50px; color: #818cf8;">
           <i class="fas fa-circle-notch fa-spin" style="font-size: 3rem;"></i>
           <p style="margin-top: 15px;">Communicating with services...</p>
        </div>

        <div class="applications-grid" *ngIf="!isLoading">
          <div class="glass-card app-card" *ngFor="let app of pendingMentors">
            <div class="app-header">
              <div class="user-info">
                <h3>{{ app.email || 'Mentor #' + app.id }}</h3>
                <span class="exp-badge">{{ app.experience }} Years Exp</span>
              </div>
              <div class="status-pill" [ngClass]="(app.status || 'PENDING').toLowerCase()">{{ app.status || 'PENDING' }}</div>
            </div>

            <div class="app-body">
              <p class="bio">"{{ app.bio }}"</p>
              <div class="skills-list">
                <span class="skill-tag" *ngFor="let skill of app.skills">{{ skill }}</span>
              </div>
              <p class="rate">Hourly Rate: <span>&#36;{{ app.hourlyRate }}</span></p>
            </div>

            <div class="app-actions" *ngIf="currentFilter === 'PENDING'">
              <button class="approve-btn" (click)="approveMentor(app.id)">
                <i class="fas fa-check"></i> Approve
              </button>
              <button class="reject-btn">
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          </div>

          <div class="empty-state" *ngIf="pendingMentors.length === 0">
            <i class="fas fa-clipboard-check"></i>
            <p>No {{ currentFilter.toLowerCase() }} applications at the moment.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.8s ease-out;
    }

    .header-section {
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

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .glass-card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 25px;
      transition: all 0.3s ease;
    }

    .stat-card {
      text-align: center;
      border-bottom: 3px solid transparent;
      cursor: pointer;
    }

    .stat-card.active {
      border-bottom: 3px solid var(--primary-color);
      background: rgba(99, 102, 241, 0.1);
    }

    .stat-card:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .stat-value {
      display: block;
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
    }

    .stat-label {
      color: var(--text-muted);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .section-title {
      color: white;
      margin-bottom: 25px;
      font-size: 1.5rem;
    }

    .applications-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 25px;
    }

    .app-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .user-info h3 {
      margin: 0;
      font-size: 18px;
      color: white;
    }

    .exp-badge {
      font-size: 12px;
      color: #818cf8;
      background: rgba(129, 140, 248, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .status-pill {
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .status-pill.pending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .bio {
      color: var(--text-muted);
      font-style: italic;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;
    }

    .skill-tag {
      font-size: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      padding: 4px 10px;
      border-radius: 6px;
      color: var(--text-muted);
    }

    .rate {
      font-size: 14px;
      color: var(--text-muted);
    }

    .rate span {
      color: #10b981;
      font-weight: 700;
      font-size: 18px;
    }

    .app-actions {
      display: flex;
      gap: 12px;
      margin-top: auto;
    }

    .approve-btn, .reject-btn {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .approve-btn {
      background: #10b981;
      color: white;
      border: none;
    }

    .approve-btn:hover {
      background: #059669;
      transform: translateY(-2px);
    }

    .reject-btn {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .reject-btn:hover {
      background: #ef4444;
      color: white;
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
      opacity: 0.1;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private mentorService = inject(MentorService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  
  pendingMentors: any[] = [];
  currentFilter: string = 'PENDING';
  isLoading: boolean = false;
  errorMessage: string = '';

  // Isolated counts for the stat cards
  pendingCount: number = 0;
  approvedCount: number = 0;
  rejectedCount: number = 0;

  ngOnInit() {
    this.refreshCounts();
    this.loadMentorsByStatus('PENDING');
  }

  refreshCounts() {
    // Silently fetch counts to keep the UI stats accurate
    this.mentorService.getMentorsByStatus('PENDING').subscribe(res => this.pendingCount = res.data?.length || 0);
    this.mentorService.getMentorsByStatus('APPROVED').subscribe(res => this.approvedCount = res.data?.length || 0);
    this.mentorService.getMentorsByStatus('REJECTED').subscribe(res => this.rejectedCount = res.data?.length || 0);
  }

  loadMentorsByStatus(status: string) {
    if (this.isLoading && this.currentFilter === status) return;

    this.currentFilter = status;
    this.isLoading = true;
    this.errorMessage = '';
    this.pendingMentors = []; 

    console.log(`[SkillSync] Fetching ${status} mentors...`);

    this.mentorService.getMentorsByStatus(status).subscribe({
      next: (res) => {
        console.log(`[SkillSync] Successfully received ${status} data:`, res.data);
        this.pendingMentors = res.data || [];
        this.isLoading = false;
        
        // Refresh counts whenever we change something
        this.refreshCounts();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = `Could not load ${status} applications. (Error: ${err.status})`;
        console.error(`[SkillSync] Failed to load ${status} mentors`, err);
        this.cdr.detectChanges();
      }
    });
  }

  loadPendingMentors() {
     this.loadMentorsByStatus(this.currentFilter);
  }

  approveMentor(id: number) {
    this.isLoading = true;
    this.mentorService.approveMentor(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadMentorsByStatus('PENDING');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Failed to approve mentor. Please check server logs.";
        this.cdr.detectChanges();
      }
    });
  }
}
