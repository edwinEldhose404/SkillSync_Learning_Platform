import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MentorService, MentorRequest } from '../../../core/services/mentor.service';
import { SkillService, Skill } from '../../../core/services/skill.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mentor-apply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="apply-container">
      <div class="glass-card apply-card">
        <div class="header">
          <h1 class="glow-text">Apply to be a Mentor</h1>
          <p class="subtitle">Share your knowledge and earn by helping others grow</p>
        </div>

        <div class="error-banner" *ngIf="errorMessage" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 15px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
          {{ errorMessage }}
        </div>

        <div class="form-grid">
          <div class="form-group full-width">
            <label>Professional Bio</label>
            <textarea [(ngModel)]="request.bio" placeholder="Tell us about your expertise and teaching style..."></textarea>
          </div>

          <div class="form-group">
            <label>Years of Experience</label>
            <input type="number" [(ngModel)]="request.experience" placeholder="e.g. 5">
          </div>

          <div class="form-group">
            <label>Hourly Rate ($)</label>
            <input type="number" [(ngModel)]="request.hourlyRate" placeholder="e.g. 50">
          </div>

          <div class="form-group full-width">
            <label>Select Your Skills</label>
            <div class="skills-selector">
              <div class="skill-pill" 
                   *ngFor="let skill of availableSkills"
                   [class.selected]="isSelected(skill.id!)"
                   (click)="toggleSkill(skill.id!)">
                {{ skill.name }}
              </div>
            </div>
          </div>
        </div>

        <div class="actions">
          <div class="validation-warning" *ngIf="!isFormValid" style="color: #94a3b8; font-size: 13px; text-align: center; margin-bottom: 10px;">
            Please fill in all fields (Bio, Experience, Rate, and Skills) to submit.
          </div>
          <button class="submit-btn" (click)="submitApplication()" [disabled]="!isFormValid">
            Submit Application
          </button>
        </div>

        <div class="success-overlay" *ngIf="isSuccess">
          <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h2>Application Submitted!</h2>
            <p>Our admin team will review your profile shortly.</p>
            <button class="close-btn" (click)="closeWindow()">Close This Tab</button>
          </div>
        </div>

        <div class="success-overlay" *ngIf="isAlreadyApplied">
          <div class="success-content" style="background: rgba(30, 41, 59, 0.95); padding: 40px; border-radius: 20px; border: 1px solid rgba(99, 102, 241, 0.3);">
            <i class="fas fa-info-circle" style="color: #6366f1;"></i>
            <h2>Already Applied!</h2>
            <p style="color: #cbd5e1; margin-bottom: 25px;">Your mentor application is already pending review by our administration team. You do not need to apply again.</p>
            <button class="submit-btn" (click)="goBackToMentors()" style="width: auto; padding: 12px 30px;">Back to Mentors Hub</button>
          </div>
        </div>

        <div class="success-overlay" *ngIf="isAlreadyMentorOrAdmin">
          <div class="success-content" style="background: rgba(30, 41, 59, 0.95); padding: 40px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.3);">
            <i class="fas fa-shield-alt" style="color: #f59e0b;"></i>
            <h2>Privileged Account</h2>
            <p style="color: #cbd5e1; margin-bottom: 25px;">You are already registered as a {{ currentRole }}. High-level accounts cannot submit new mentor applications.</p>
            <button class="submit-btn" (click)="goBackToMentors()" style="width: auto; padding: 12px 30px; background: #f59e0b;">Return to Hub</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .apply-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: #0f172a;
    }

    .apply-card {
      max-width: 800px;
      width: 100%;
      padding: 50px;
      position: relative;
      overflow: hidden;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .glow-text {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }

    .subtitle {
      color: #94a3b8;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 25px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      display: block;
      color: #e2e8f0;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .form-group input, .form-group textarea {
      width: 100%;
      padding: 12px 16px;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-family: inherit;
      transition: all 0.3s ease;
    }

    .form-group textarea {
      height: 120px;
      resize: vertical;
    }

    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
    }

    .skills-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 15px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
    }

    .skill-pill {
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .skill-pill:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .skill-pill.selected {
      background: #6366f1;
      color: white;
      border-color: #818cf8;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
    }

    .actions {
      margin-top: 40px;
    }

    .submit-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .success-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      animation: fadeIn 0.4s ease-out;
    }

    .success-content {
      text-align: center;
      color: white;
    }

    .success-content i {
      font-size: 5rem;
      color: #10b981;
      margin-bottom: 20px;
    }

    .close-btn {
      margin-top: 25px;
      padding: 12px 30px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      color: white;
      cursor: pointer;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class MentorApplyComponent implements OnInit {
  private mentorService = inject(MentorService);
  private skillService = inject(SkillService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  availableSkills: Skill[] = [];
  request: MentorRequest = {
    userId: 0,
    bio: '',
    experience: 0,
    hourlyRate: 0,
    skillIds: [],
    email: ''
  };
  
  isSuccess = false;
  isAlreadyApplied = false;
  isAlreadyMentorOrAdmin = false;
  currentRole = '';
  errorMessage = '';

  ngOnInit() {
    this.loadSkills();
    this.loadUserAndProfile();
  }

  loadSkills() {
    this.skillService.getAllPublicSkills().subscribe({
      next: (skills: Skill[]) => {
        this.availableSkills = skills;
        console.log('[SkillSync] Skills loaded:', skills.length);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('[SkillSync] Failed to load skills', err)
    });
  }

  loadUserAndProfile() {
    let emailFromToken = '';
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        this.errorMessage = 'You must be logged in to apply as a mentor.';
        return;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      emailFromToken = payload.sub || payload.email || '';
      this.request.email = emailFromToken;
    } catch (e) {
      console.error('[SkillSync] Error parsing token', e);
    }

    // Now ensure profile exists in user-service and grab the correct Profile ID
    this.authService.getMyProfile().subscribe({
      next: (res) => {
        console.log('[SkillSync] User profile exists:', res);
        this.currentRole = (res?.role || 'USER').toUpperCase();
        if (this.currentRole === 'MENTOR' || this.currentRole === 'ADMIN') {
          this.isAlreadyMentorOrAdmin = true;
        }
        
        const profileId = res?.userId ?? res?.user_id ?? res?.id;
        if (profileId) {
          this.request.userId = Number(profileId);
        }
      },
      error: (err) => {
        if (err.status === 404) {
          console.log('[SkillSync] Profile not found. Auto-creating stub profile...');
          const email = this.request.email || 'user@example.com';
          const stubProfile = {
            fullName: email.split('@')[0],
            bio: 'New user',
            skills: 'General',
            location: 'Not set',
            phone: null
          };
          this.authService.createProfile(stubProfile).subscribe({
            next: (created) => {
               console.log('[SkillSync] Auto-created profile:', created);
               const profileId = created?.userId ?? created?.user_id ?? created?.id;
               if (profileId) {
                 this.request.userId = Number(profileId);
               }
            },
            error: (createErr) => {
               console.error('[SkillSync] Failed to auto-create profile:', createErr);
               this.errorMessage = 'Could not set up your user profile. Application might fail.';
            }
          });
        }
      }
    });
  }

  toggleSkill(id: number) {
    const index = this.request.skillIds.indexOf(id);
    if (index === -1) {
      this.request.skillIds.push(id);
    } else {
      this.request.skillIds.splice(index, 1);
    }
  }

  isSelected(id: number): boolean {
    return this.request.skillIds.includes(id);
  }

  get isFormValid(): boolean {
    return this.request.bio.trim().length > 0 && 
           this.request.experience > 0 && 
           this.request.hourlyRate > 0 && 
           this.request.skillIds.length > 0;
  }

  submitApplication() {
    console.log('[SkillSync] Submitting mentor application:', this.request);
    this.errorMessage = '';
    
    this.mentorService.applyToBeMentor(this.request).subscribe({
      next: (res) => {
        console.log('[SkillSync] Application response:', res);
        if (res.success) {
          this.isSuccess = true;
        } else {
          this.errorMessage = res.message || 'Application failed. Please try again.';
        }
      },
      error: (err) => {
        console.error('[SkillSync] Application error', err);
        const errorMsg = err.error?.message || '';
        if (errorMsg.includes('already applied')) {
          this.isAlreadyApplied = true;
        } else {
          this.errorMessage = errorMsg || 'Could not connect to service. Try again later.';
        }
      }
    });
  }

  closeWindow() {
    window.close();
  }

  goBackToMentors() {
    this.router.navigate(['/mentors']);
  }
}
