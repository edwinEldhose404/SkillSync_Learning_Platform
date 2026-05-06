import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">
          <h2 class="glow-text">SkillSync</h2>
        </div>
        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <i class="fas fa-home"></i> <span>Dashboard</span>
          </a>
          <a routerLink="/skills" routerLinkActive="active">
            <i class="fas fa-rocket"></i> <span>Skills</span>
          </a>
          <a routerLink="/mentors" routerLinkActive="active">
            <i class="fas fa-user-tie"></i> <span>Mentors</span>
          </a>
          <a routerLink="/groups" routerLinkActive="active">
            <i class="fas fa-users"></i> <span>Groups</span>
          </a>
          <a routerLink="/sessions" routerLinkActive="active">
            <i class="fas fa-calendar-check"></i> <span>Sessions</span>
          </a>
          <div class="nav-divider"></div>
          <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="active" class="admin-link">
            <i class="fas fa-user-shield"></i> <span>Admin Panel</span>
          </a>
        </nav>
        
        <div class="user-footer">
          <div class="user-pill">
            <div class="avatar">{{ userName.charAt(0).toUpperCase() }}</div>
            <div class="user-meta">
              <span class="name">{{ userName }}</span>
              <span class="role">{{ displayRole }}</span>
            </div>
          </div>
          <button (click)="logout()" class="logout-icon" title="Log Out">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="top-nav">
          <div class="welcome-msg">
            <h1>Welcome back, <span class="highlight">{{ userName }}</span></h1>
            <p>Your learning progress looks great this week!</p>
          </div>
          <div class="header-actions">
            <div class="notification-bell">
              <i class="fas fa-bell"></i>
              <span class="badge"></span>
            </div>
            <button class="profile-btn">
              <i class="fas fa-user-circle"></i>
            </button>
          </div>
        </header>

        <div class="dashboard-body">
          <!-- Stats Row -->
          <div class="stats-grid">
            <div class="stat-card glass-card">
              <div class="stat-icon indigo"><i class="fas fa-graduation-cap"></i></div>
              <div class="stat-data">
                <span class="label">Skills Earned</span>
                <span class="value">12</span>
              </div>
            </div>
            <div class="stat-card glass-card">
              <div class="stat-icon purple"><i class="fas fa-comments"></i></div>
              <div class="stat-data">
                <span class="label">Live Sessions</span>
                <span class="value">05</span>
              </div>
            </div>
            <div class="stat-card glass-card">
              <div class="stat-icon blue"><i class="fas fa-project-diagram"></i></div>
              <div class="stat-data">
                <span class="label">Active Groups</span>
                <span class="value">08</span>
              </div>
            </div>
          </div>

          <!-- Main Feature Grid -->
          <div class="features-grid">
            <div class="feature-card glass-card" routerLink="/skills">
              <div class="card-content">
                <div class="card-icon"><i class="fas fa-search-plus"></i></div>
                <h3>Explore Skills</h3>
                <p>Discover new technologies and build your expertise with curated paths.</p>
              </div>
              <div class="card-footer">
                <span>Browse Catalog</span>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>

            <div class="feature-card glass-card" routerLink="/mentors">
              <div class="card-content">
                <div class="card-icon"><i class="fas fa-user-friends"></i></div>
                <h3>Mentor Connect</h3>
                <p>Get personalized guidance from industry professionals and peers.</p>
              </div>
              <div class="card-footer">
                <span>Find a Mentor</span>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>

            <div class="feature-card glass-card" routerLink="/groups">
              <div class="card-content">
                <div class="card-icon"><i class="fas fa-layer-group"></i></div>
                <h3>Study Groups</h3>
                <p>Collaborate in real-time with fellow learners in topic-based groups.</p>
              </div>
              <div class="card-footer">
                <span>Join Community</span>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>

            <div class="feature-card glass-card" routerLink="/sessions">
              <div class="card-content">
                <div class="card-icon"><i class="fas fa-video"></i></div>
                <h3>My Sessions</h3>
                <p>Manage your upcoming learning appointments and session history.</p>
              </div>
              <div class="card-footer">
                <span>View Schedule</span>
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
          </div>

          <!-- Bottom Section -->
          <div class="bottom-grid">
            <div class="activity-panel glass-card">
              <div class="panel-header">
                <h3>Recent Activity</h3>
                <button class="text-link">View All</button>
              </div>
              <div class="activity-list">
                <div class="activity-item">
                  <div class="activity-dot"></div>
                  <div class="activity-text">
                    <p>Enrolled in <strong>Advanced TypeScript</strong></p>
                    <span class="time">2 hours ago</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-dot"></div>
                  <div class="activity-text">
                    <p>Joined <strong>React Developers</strong> group</p>
                    <span class="time">Yesterday</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-dot"></div>
                  <div class="activity-text">
                    <p>Completed session with <strong>Mentor Alex</strong></p>
                    <span class="time">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="promotion-panel glass-card" *ngIf="liveRole === 'USER'">
              <div class="promo-content">
                <h3>Upgrade to Mentor</h3>
                <p>Share your knowledge and earn rewards while helping others.</p>
                <button class="promo-btn" routerLink="/mentors">Learn More</button>
              </div>
              <div class="promo-bg-icon">
                <i class="fas fa-award"></i>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      min-height: 100vh;
      background: var(--bg-color);
      color: white;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(20px);
      border-right: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      padding: 30px 0;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 100;
    }

    .logo {
      padding: 0 25px 40px;
    }

    .glow-text {
      font-size: 1.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -1px;
    }

    .nav-links {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 0 15px;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 15px;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 10px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .nav-links a i {
      font-size: 1.1rem;
      width: 20px;
      text-align: center;
    }

    .nav-links a:hover, .nav-links a.active {
      background: rgba(99, 102, 241, 0.1);
      color: white;
    }

    .nav-links a.active {
      color: #818cf8;
      background: rgba(99, 102, 241, 0.15);
    }

    .nav-divider {
      height: 1px;
      background: var(--glass-border);
      margin: 15px 15px;
    }

    .admin-link {
      color: #fbbf24 !important;
    }

    .admin-link:hover {
      background: rgba(251, 191, 36, 0.1) !important;
    }

    .user-footer {
      padding: 20px 15px;
      border-top: 1px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }

    .avatar {
      width: 36px;
      height: 36px;
      background: var(--primary-gradient, linear-gradient(135deg, #6366f1 0%, #a855f7 100%));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .user-meta .name {
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-meta .role {
      font-size: 11px;
      color: var(--text-muted);
    }

    .logout-icon {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .logout-icon:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* Main Content Styles */
    .main-content {
      flex: 1;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
    }

    .welcome-msg h1 {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 8px 0;
    }

    .highlight {
      color: #818cf8;
    }

    .welcome-msg p {
      color: var(--text-muted);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 15px;
    }

    .notification-bell {
      position: relative;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .notification-bell .badge {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid var(--bg-color);
    }

    .profile-btn {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }

    .stat-icon.indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .stat-icon.purple { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
    .stat-icon.blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

    .stat-data {
      display: flex;
      flex-direction: column;
    }

    .stat-data .label {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .stat-data .value {
      font-size: 24px;
      font-weight: 800;
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }

    .feature-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      border-color: var(--primary-color);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .card-icon {
      font-size: 1.8rem;
      color: #818cf8;
      margin-bottom: 15px;
    }

    .feature-card h3 {
      font-size: 1.25rem;
      margin: 0 0 10px 0;
    }

    .feature-card p {
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 25px;
      padding-top: 15px;
      border-top: 1px solid var(--glass-border);
      color: #818cf8;
      font-weight: 600;
      font-size: 13px;
    }

    /* Bottom Grid */
    .bottom-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 20px;
    }

    .activity-panel {
      padding: 25px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .panel-header h3 { margin: 0; font-size: 1.1rem; }

    .text-link {
      background: none;
      border: none;
      color: #818cf8;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .activity-item {
      display: flex;
      gap: 15px;
    }

    .activity-dot {
      width: 8px;
      height: 8px;
      background: #818cf8;
      border-radius: 50%;
      margin-top: 6px;
      box-shadow: 0 0 10px rgba(129, 140, 248, 0.5);
    }

    .activity-text p {
      margin: 0;
      font-size: 14px;
    }

    .activity-text .time {
      font-size: 12px;
      color: var(--text-muted);
    }

    .promotion-panel {
      padding: 25px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    }

    .promo-content {
      position: relative;
      z-index: 2;
    }

    .promo-content h3 { margin: 0 0 10px 0; }
    .promo-content p { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }

    .promo-btn {
      padding: 10px 20px;
      background: var(--primary-color);
      border: none;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .promo-btn:hover { background: var(--primary-hover); transform: scale(1.05); }

    .promo-bg-icon {
      position: absolute;
      right: -20px;
      bottom: -20px;
      font-size: 8rem;
      color: rgba(255, 255, 255, 0.05);
      transform: rotate(-15deg);
    }

    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      transition: all 0.3s ease;
    }

    @media (max-width: 1024px) {
      .sidebar { width: 80px; }
      .sidebar span, .sidebar .user-meta { display: none; }
      .sidebar .logo { padding: 0 0 40px; text-align: center; }
      .sidebar .logo h2 { font-size: 1.2rem; }
      .nav-links a { justify-content: center; padding: 15px; }
      .user-footer { flex-direction: column; }
    }

    @media (max-width: 768px) {
      .stats-grid, .features-grid, .bottom-grid { grid-template-columns: 1fr; }
      .dashboard-wrapper { flex-direction: column; }
      .sidebar { width: 100%; height: auto; position: relative; padding: 15px 0; }
      .nav-links { flex-direction: row; overflow-x: auto; padding-bottom: 5px; }
      .nav-links a { white-space: nowrap; }
    }
  `]

})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  liveRole: string = 'USER';
  userName: string = 'User';

  ngOnInit() {
    this.loadLiveProfile();
  }

  loadLiveProfile() {
    const tokenRole = (this.getRoleFromToken() || 'USER').toUpperCase();
    this.liveRole = tokenRole; 

    this.authService.getMyProfile().subscribe({
      next: (profile) => {
        const apiRole = (profile.role || 'USER').toUpperCase();
        
        console.log(`[SkillSync] Role Sync - Token: ${tokenRole}, API: ${apiRole}`);

        if (tokenRole === 'ADMIN') {
          this.liveRole = 'ADMIN';
        } else if (apiRole === 'ADMIN' || apiRole === 'MENTOR') {
          this.liveRole = apiRole;
        } else {
          this.liveRole = tokenRole;
        }

        this.userName = profile.fullName || this.authService.getEmailFromToken() || 'User';
      },
      error: (err) => {
        this.liveRole = tokenRole;
        this.userName = this.authService.getEmailFromToken() || 'User';
      }
    });
  }

  get isAdmin(): boolean {
    return this.liveRole === 'ADMIN';
  }

  get userRole(): string {
    return this.liveRole;
  }

  private getRoleFromToken(): string {
    const token = localStorage.getItem('jwt_token');
    if (!token) return 'USER';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || 'USER';
    } catch {
      return 'USER';
    }
  }

  get displayRole(): string {
    switch (this.liveRole) {
      case 'ADMIN': return 'Administrator';
      case 'MENTOR': return 'Mentor';
      default: return 'User';
    }
  }

  logout() {
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }
}
