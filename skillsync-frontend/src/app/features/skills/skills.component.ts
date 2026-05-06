import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SkillService, Skill } from '../../core/services/skill.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="glass-card wide-card">
        <div class="header">
          <div class="header-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h2 style="margin: 0;">Skill Catalog</h2>
            <button routerLink="/dashboard" class="submit-btn" style="width: auto; margin-top: 0; padding: 8px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">← Back to Dashboard</button>
          </div>
          <p>Explore and add new skills to the platform.</p>
        </div>

        <div class="error-banner" *ngIf="errorMessage">{{ errorMessage }}</div>

        <div class="content-grid">
          <div class="skills-list">
            <h3>Available Skills</h3>
            <div *ngIf="skills.length === 0" class="empty-state">No skills found. Add one!</div>
            <div class="skill-pill-container">
              <div *ngFor="let skill of skills" class="skill-pill">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-category">{{ skill.category }}</span>
              </div>
            </div>
          </div>

          <div class="add-skill-form">
            <h3>Add New Skill</h3>
            <form (ngSubmit)="addSkill()">
              <div class="form-group">
                <label>Skill Name</label>
                <input type="text" [(ngModel)]="newSkill.name" name="name" required placeholder="e.g. Angular" />
              </div>
              <div class="form-group">
                <label>Category</label>
                <input type="text" [(ngModel)]="newSkill.category" name="category" placeholder="e.g. Frontend" />
              </div>
              <button type="submit" [disabled]="!newSkill.name" class="submit-btn">Add Skill</button>
            </form>
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
      max-width: 900px;
    }
    .header h2 {
      margin: 0 0 10px;
      font-size: 32px;
      font-weight: 600;
    }
    .header p {
      color: var(--text-muted);
      font-size: 16px;
      margin-bottom: 30px;
    }
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    @media (max-width: 768px) {
      .content-grid {
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
    .skill-pill-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .skill-pill {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 8px 14px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .skill-name {
      font-weight: 600;
      color: var(--text-main);
    }
    .skill-category {
      font-size: 12px;
      background: var(--primary-color);
      padding: 2px 8px;
      border-radius: 10px;
      color: white;
    }
    .empty-state {
      color: var(--text-muted);
      font-style: italic;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--text-muted);
    }
    input {
      width: 100%;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: white;
      font-size: 15px;
      outline: none;
      transition: all 0.3s ease;
    }
    input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .submit-btn {
      width: 100%;
      padding: 12px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .submit-btn:hover:not(:disabled) {
      background: var(--primary-hover);
    }
    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class SkillsComponent implements OnInit {
  private skillService = inject(SkillService);
  
  skills: Skill[] = [];
  newSkill: Skill = { name: '', category: '' };
  errorMessage = '';

  ngOnInit() {
    this.loadSkills();
  }

  loadSkills() {
    this.skillService.getAllPublicSkills().subscribe({
      next: (data) => {
        this.skills = data;
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to load skills', err);
        this.errorMessage = 'Could not load skills from the server.';
      }
    });
  }

  addSkill() {
    if (!this.newSkill.name) return;
    
    this.skillService.createSkill(this.newSkill).subscribe({
      next: (data) => {
        this.skills.push(data);
        this.newSkill = { name: '', category: '' }; // reset
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to add skill', err);
        this.errorMessage = err.error?.message || 'Failed to add skill. Are you authorized?';
      }
    });
  }
}
