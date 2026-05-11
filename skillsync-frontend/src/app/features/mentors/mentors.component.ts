import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MentorService, MentorResponse, MentorRequest } from '../../core/services/mentor.service';
import { AuthService } from '../../core/services/auth.service';
import { SkillService, Skill } from '../../core/services/skill.service';
import { ReviewService, ReviewResponse, ReviewRequest } from '../../core/services/review.service';
import { SessionService } from '../../core/services/session.service';

interface MentorWithDraft extends MentorResponse {
  draftRating?: number;
  draftComment?: string;
  reviews?: ReviewResponse[];
  loadingReviews?: boolean;
  selectedDate?: string;
}

@Component({
  selector: 'app-mentors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="glass-card wide-card">
        <div class="header">
          <div class="header-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h2 style="margin: 0;">Mentors Hub</h2>
            <button routerLink="/dashboard" class="submit-btn" style="width: auto; margin-top: 0; padding: 8px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">← Back to Dashboard</button>
          </div>
          <div class="header-content">
            <p>Find a mentor to guide you, or share your own expertise with the community!</p>
          </div>
          <button *ngIf="canApply" (click)="openApplyPage()" class="become-mentor-btn" style="margin-bottom: 30px;">
            <i class="fas fa-graduation-cap"></i> Become a Mentor
          </button>
        </div>

        <div class="error-banner" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="success-banner" *ngIf="successMessage">{{ successMessage }}</div>

        <div class="content-grid">
          <div class="mentors-list">
            <h3>Available Mentors</h3>
            <div *ngIf="loadingMentors" class="loading-state" style="text-align: center; padding: 40px; color: var(--text-muted);">
              <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i>
              <p>Searching for mentors...</p>
            </div>
            <div *ngIf="!loadingMentors && mentors.length === 0" class="empty-state">No mentors found. Be the first!</div>
            
            <div class="mentor-cards">
              <div *ngFor="let mentor of filteredMentors" class="mentor-card">
                <div class="mentor-header">
                  <div class="mentor-avatar">{{ (mentor.email || 'M').charAt(0).toUpperCase() }}</div>
                  <div class="mentor-info-main">
                    <h4 class="mentor-display-name">{{ mentor.email || 'Mentor #' + mentor.id }}</h4>
                    <div class="mentor-sub-info">
                      <span class="mentor-rate">\${{ mentor.hourlyRate }}/hr</span>
                      <span class="mentor-rating">★ {{ mentor.rating || 'New' }}</span>
                    </div>
                  </div>
                </div>
                <p class="mentor-bio">"{{ mentor.bio }}"</p>
                <div class="mentor-meta">Experience: {{ mentor.experience }} years</div>
                
                <div class="skill-pill-container" style="margin-top: 10px;">
                  <span *ngFor="let skill of mentor.skills" class="skill-category">{{ skill }}</span>
                </div>

                <div class="mentor-actions">
                  <button class="review-toggle-btn" (click)="toggleReviews(mentor.id)">
                    <i class="fas" [class.fa-comments]="expandedMentorId !== mentor.id" [class.fa-chevron-up]="expandedMentorId === mentor.id"></i>
                    {{ expandedMentorId === mentor.id ? 'Close Reviews' : 'See Reviews' }}
                  </button>
                  <div class="booking-input-group" *ngIf="userRole !== 'ADMIN'">
                    <input type="datetime-local" [(ngModel)]="mentor.selectedDate" class="date-picker">
                    <button class="book-btn" (click)="requestSession(mentor)">
                      <i class="fas fa-calendar-plus"></i> Book
                    </button>
                  </div>
                  <button *ngIf="userRole === 'ADMIN'" class="remove-btn" (click)="removeMentor(mentor.id)">
                    <i class="fas fa-user-slash"></i> Remove Mentor
                  </button>
                </div>

                <!-- Independent Review State (Attached to mentor object) -->
                <div class="review-section" *ngIf="expandedMentorId === mentor.id">
                  <div class="review-header">
                    <h4>Mentor Reviews</h4>
                    <span class="review-count">{{ mentor.reviews?.length || 0 }} reviews</span>
                  </div>

                  <div class="reviews-list">
                    <div class="review-item" *ngFor="let review of mentor.reviews">
                      <div class="review-top">
                        <div class="stars">
                          <span *ngFor="let s of [1,2,3,4,5]" 
                                style="font-size: 14px; margin-right: 2px; color: rgba(255,255,255,0.1);"
                                [style.color]="s <= review.rating ? '#fbbf24' : 'rgba(255,255,255,0.1)'">
                            ★
                          </span>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                          <span class="review-date">{{ review.createdAt | date:'shortDate' }}</span>
                          <button *ngIf="userRole === 'ADMIN' || review.userId === currentUserId" (click)="deleteReview(review.id, mentor)" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0;" title="Delete Review">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <p class="review-comment">"{{ review.comment }}"</p>
                      <span class="reviewer">User #{{ review.userId }}</span>
                    </div>

                    <div class="empty-reviews" *ngIf="(!mentor.reviews || mentor.reviews.length === 0) && !mentor.loadingReviews">
                      No reviews yet. Be the first to rate!
                    </div>

                    <div class="loading-spinner" *ngIf="mentor.loadingReviews" style="text-align: center; padding: 15px;">
                      <i class="fas fa-circle-notch fa-spin"></i> Loading reviews...
                    </div>
                  </div>

                  <!-- Add Review Form (Independent per mentor) -->
                  <div class="add-review-form" *ngIf="userRole !== 'ADMIN'">
                    <h5>Leave a Review</h5>
                    <div class="rating-input" style="border: 2px solid #fbbf24; padding: 15px; background: rgba(251, 191, 36, 0.05); margin: 15px 0;">
                      <span *ngFor="let s of [1,2,3,4,5]" 
                            class="star-item"
                            [class.filled]="s <= (mentor.draftRating || 0)"
                            (click)="setMentorRating(mentor, s)"
                            style="font-size: 40px; cursor: pointer; margin: 0 5px; color: rgba(255,255,255,0.2); transition: all 0.2s;">
                        ★
                      </span>
                      <span class="rating-label" *ngIf="mentor.draftRating" style="color: #fbbf24; font-weight: bold; margin-left: 15px;">
                        Rating: {{ mentor.draftRating }}/5
                      </span>
                    </div>
                    <textarea [(ngModel)]="mentor.draftComment" placeholder="How was your experience with this mentor?"></textarea>
                    <button class="submit-review-btn" 
                            [disabled]="loadingReviews"
                            (click)="submitReview(mentor)">
                      Post Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      animation: fadeIn 0.5s ease-out;
    }
    .wide-card {
      max-width: 1200px;
    }
    .header p {
      color: var(--text-muted);
      font-size: 16px;
      margin-bottom: 30px;
    }
    .error-banner, .success-banner {
      padding: 15px 20px;
      border-radius: 12px;
      margin-bottom: 25px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideDown 0.4s ease-out;
    }
    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .success-banner {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
    }
    .content-grid {
      display: block;
    }
    .mentor-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
      gap: 25px;
    }
    @media (max-width: 992px) {
      .mentor-cards {
        grid-template-columns: 1fr;
      }
    }
    h3 {
      font-size: 20px;
      margin-top: 0;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 10px;
    }
    
    .mentor-card {
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }
    .mentor-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }
    .mentor-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
    }
    .mentor-avatar {
      width: 50px;
      height: 50px;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
      color: white;
    }
    .mentor-info-main {
      flex: 1;
    }
    .mentor-display-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: white;
    }
    .mentor-sub-info {
      display: flex;
      gap: 12px;
      font-size: 13px;
      margin-top: 2px;
    }
    .mentor-rate {
      color: #10b981;
      font-weight: 600;
    }
    .mentor-rating {
      color: #fbbf24;
    }
    .mentor-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .review-toggle-btn, .book-btn {
      flex: 1;
      padding: 8px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .review-toggle-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .review-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    .book-btn {
      background: var(--primary-color);
      border: none;
      color: white;
    }
    .book-btn:hover {
      background: var(--primary-hover);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }
    .booking-input-group {
      flex: 2;
      display: flex;
      gap: 8px;
    }
    .date-picker {
      flex: 1;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 8px;
      color: white;
      font-size: 13px;
      outline: none;
    }
    .date-picker:focus {
      border-color: var(--primary-color);
    }
    ::-webkit-calendar-picker-indicator {
      filter: invert(1);
      cursor: pointer;
    }
    .remove-btn {
      flex: 1;
      padding: 8px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .remove-btn:hover {
      background: #ef4444;
      color: white;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }
    .become-mentor-btn {
      padding: 10px 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }
    .become-mentor-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
    }
    .review-section {
      margin-top: 20px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      animation: slideDown 0.3s ease-out;
    }
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .review-header h4 {
      margin: 0;
      font-size: 15px;
      color: white;
    }
    .review-count {
      font-size: 12px;
      color: var(--text-muted);
    }
    .review-item {
      padding-bottom: 15px;
      margin-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .review-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .stars i {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.1);
      margin-right: 2px;
    }
    .star-item.filled {
      color: #fbbf24 !important;
      text-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
    }
    .review-date {
      font-size: 11px;
      color: #64748b;
    }
    .review-comment {
      font-size: 14px;
      color: #cbd5e1;
      margin: 0 0 5px 0;
    }
    .reviewer {
      font-size: 11px;
      color: #64748b;
    }
    .add-review-form {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid rgba(255, 255, 255, 0.05);
    }
    .add-review-form h5 {
      margin: 0 0 10px 0;
      color: white;
    }
    .rating-input {
      margin-bottom: 15px;
      display: flex;
      gap: 5px;
    }
    .rating-input {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.03);
      padding: 10px 15px;
      border-radius: 8px;
    }
    .rating-input i {
      font-size: 32px;
      color: rgba(255, 255, 255, 0.1);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      margin: 0 4px;
    }
    .rating-label {
      font-size: 13px;
      color: #fbbf24;
      font-weight: 600;
      margin-left: 10px;
    }
    .rating-input i:hover, .rating-input i.filled {
      color: #fbbf24;
      transform: scale(1.1);
    }
    .submit-review-btn {
      width: 100%;
      padding: 10px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      border-radius: 8px;
      margin-top: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .submit-review-btn:hover:not(:disabled) {
      background: var(--primary-color);
      color: white;
    }
    .loading-spinner {
      text-align: center;
      padding: 20px;
      color: var(--text-muted);
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class MentorsComponent implements OnInit {
  private mentorService = inject(MentorService);
  private authService = inject(AuthService);
  private skillService = inject(SkillService);
  private reviewService = inject(ReviewService);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  
  mentors: MentorWithDraft[] = [];
  loadingMentors = false;
  availableSkills: Skill[] = [];
  selectedSkillIds: Set<number> = new Set();
  
  expandedMentorId: number | null = null;
  mentorReviews: ReviewResponse[] = [];
  loadingReviews = false;
  
  newReview: ReviewRequest = {
    mentorId: 0,
    userId: 0,
    rating: 0,
    comment: ''
  };

  errorMessage = '';
  successMessage = '';
  
  currentUserId: number | null = null;
  userRole: string = 'USER';

  ngOnInit() {
    this.userRole = this.authService.getRoleFromToken().toUpperCase();
    
    // Extract User ID from token directly
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const id = payload.userId ?? payload.user_id ?? payload.id ?? payload.sub;
        if (id && !isNaN(Number(id))) {
          this.currentUserId = Number(id);
        }
      } catch (e) {
        console.error('[SkillSync] Token decode failed:', e);
      }
    }

    this.loadMentors();
    this.loadSkills();
  }

  get filteredMentors() {
    let filtered = this.mentors;
    
    // 1. Hide current user's profile
    if (this.currentUserId) {
      filtered = filtered.filter(m => m.userId !== this.currentUserId);
    }
    
    // 2. Hide any non-APPROVED mentors (secondary safeguard)
    filtered = filtered.filter(m => m.status === 'APPROVED');
    
    return filtered;
  }

  get canApply(): boolean {
    return this.userRole !== 'ADMIN' && this.userRole !== 'MENTOR';
  }

  loadSkills() {
    this.skillService.getAllPublicSkills().subscribe({
      next: (skills) => {
        this.availableSkills = skills;
        console.log('[SkillSync] Loaded skills:', skills);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[SkillSync] Failed to load skills', err)
    });
  }

  toggleSkill(id: number) {
    if (this.selectedSkillIds.has(id)) {
      this.selectedSkillIds.delete(id);
    } else {
      this.selectedSkillIds.add(id);
    }
  }

  /** Decode the JWT stored in localStorage and return the userId claim. */
  private getUserIdFromToken(): number | null {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) { console.warn('[SkillSync] No jwt_token found in localStorage.'); return null; }
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Log full payload so we can see what claims the backend actually sends
      console.log('[SkillSync] JWT payload:', payload);
      // Support common claim names: userId, user_id, id, sub
      const id = payload.userId ?? payload.user_id ?? payload.id;
      if (id != null) {
        const parsed = Number(id);
        return isNaN(parsed) ? null : parsed;
      }
      // sub is often an email string in Spring Security — skip it for numeric ID lookup
      console.warn('[SkillSync] No numeric userId claim found in token. Claims available:', Object.keys(payload));
      return null;
    } catch (e) {
      console.error('[SkillSync] Failed to decode JWT:', e);
      return null;
    }
  }



  private cdr = inject(ChangeDetectorRef);

  loadMentors() {
    this.loadingMentors = true;
    console.log('[SkillSync] Fetching mentors...');

    this.mentorService.getAllMentors().subscribe({
      next: (res) => {
        console.log('[SkillSync] Mentors received:', res);
        if (res.success) {
          this.mentors = res.data.map(m => ({
            ...m,
            draftRating: 0,
            draftComment: ''
          }));
          this.errorMessage = '';
        }
        this.loadingMentors = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[SkillSync] Failed to load mentors', err);
        this.errorMessage = 'Could not load mentors from the server.';
        this.loadingMentors = false;
        this.cdr.detectChanges();
      }
    });
  }

  openApplyPage() {
    window.open('/mentors/apply', '_blank');
  }

  toggleReviews(mentorId: number) {
    if (this.expandedMentorId === mentorId) {
      this.expandedMentorId = null;
    } else {
      this.expandedMentorId = mentorId;
      // Fetch reviews if not already loaded for this specific mentor
      const mentor = this.mentors.find(m => m.id === mentorId);
      if (mentor) {
        this.loadReviews(mentor);
      }
    }
  }

  loadReviews(mentor: MentorWithDraft) {
    mentor.loadingReviews = true;
    this.reviewService.getReviewsByMentor(mentor.id).subscribe({
      next: (res) => {
        if (res.success) {
          mentor.reviews = res.data;
        }
        mentor.loadingReviews = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[SkillSync] Failed to load reviews', err);
        mentor.loadingReviews = false;
        this.cdr.detectChanges();
      }
    });
  }

  setMentorRating(mentor: any, s: number) {
    console.log('[SkillSync] Setting rating to:', s, 'for mentor:', mentor.id);
    mentor.draftRating = s;
  }

  submitReview(mentor: any) {
    console.log('[SkillSync] submitReview called for mentor:', mentor.id);
    
    if (this.currentUserId === null || this.currentUserId === undefined) {
      console.warn('[SkillSync] Cannot post review: currentUserId is null');
      this.errorMessage = 'Please log in to leave a review.';
      return;
    }

    if (!mentor.draftRating) {
      this.errorMessage = 'Please select a rating by clicking on the stars (1-5).';
      return;
    }

    if (!mentor.draftComment || mentor.draftComment.trim().length === 0) {
      this.errorMessage = 'Please type a comment for your review.';
      return;
    }

    const request: ReviewRequest = {
      mentorId: mentor.id,
      userId: this.currentUserId,
      rating: mentor.draftRating,
      comment: mentor.draftComment
    };

    console.log('[SkillSync] Sending review request:', request);
    this.errorMessage = '';
    this.successMessage = '';

    this.reviewService.addReview(request).subscribe({
      next: (res) => {
        console.log('[SkillSync] Review response received:', res);
        if (res.success) {
          this.loadReviews(mentor);
          // Clear only this mentor's draft
          mentor.draftRating = 0;
          mentor.draftComment = '';
          
          this.successMessage = 'Review posted successfully!';
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.errorMessage = res.message || 'Failed to post review. Please try again.';
        }
      },
      error: (err) => {
        console.error('[SkillSync] Failed to post review', err);
        this.errorMessage = 'Could not post your review. Check your connection and try again.';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  deleteReview(reviewId: number, mentor: any) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    this.reviewService.deleteReview(reviewId).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Review deleted successfully.';
          this.loadReviews(mentor);
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (err) => {
        console.error('[SkillSync] Failed to delete review', err);
        this.errorMessage = 'Failed to delete review. Check server logs.';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  requestSession(mentor: any) {
    if (!this.currentUserId) {
      this.errorMessage = 'Please log in to book a session.';
      return;
    }

    if (!mentor.selectedDate) {
      this.errorMessage = 'Please select a date and time for your session.';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }
    
    this.errorMessage = '';

    const dto = {
      mentor_id: mentor.id,
      learner_id: this.currentUserId,
      session_Date: new Date(mentor.selectedDate).toISOString()
    };

    this.sessionService.requestSession(dto).subscribe({
      next: (res: any) => {
        this.successMessage = 'Session requested successfully! You can manage it in the Learning Sessions tab.';
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err: any) => {
        console.error('[SkillSync] Failed to book session', err);
        this.errorMessage = 'Could not book session. ' + (err.error?.message || '');
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  removeMentor(id: number) {
    if (!confirm('Are you sure you want to remove this mentor? This action cannot be undone.')) {
      return;
    }

    this.mentorService.deleteMentor(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Mentor removed successfully.';
          this.loadMentors(); // Refresh the list
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (err) => {
        console.error('[SkillSync] Failed to remove mentor', err);
        this.errorMessage = 'Failed to remove mentor. Check server logs.';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }
}
