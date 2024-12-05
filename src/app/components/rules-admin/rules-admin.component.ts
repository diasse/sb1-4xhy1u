import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationRule } from '../../models/validation-rule.model';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rules-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    @if (isAdmin) {
      <div class="rules-admin">
        <h2>Administration des règles de validation</h2>
        
        <div class="rules-list">
          @for (rule of rules; track rule.id) {
            <div class="rule-card" [class.inactive]="!rule.isActive">
              <div class="rule-header">
                <h3>{{ rule.name }}</h3>
                <div class="rule-actions">
                  <button 
                    class="edit-btn"
                    (click)="editRule(rule)"
                  >
                    Modifier
                  </button>
                  <button 
                    [class]="rule.isActive ? 'deactivate-btn' : 'activate-btn'"
                    (click)="toggleRuleStatus(rule)"
                  >
                    {{ rule.isActive ? 'Désactiver' : 'Activer' }}
                  </button>
                </div>
              </div>

              <div class="rule-details">
                <p>Type: {{ getResourceTypeLabel(rule.resourceType) }}</p>
                @if (rule.conditions.maxDuration) {
                  <p>Durée max: {{ rule.conditions.maxDuration }}h</p>
                }
                @if (rule.conditions.minAdvanceBooking) {
                  <p>Réservation min: {{ rule.conditions.minAdvanceBooking }} jours à l'avance</p>
                }
                @if (rule.conditions.maxAdvanceBooking) {
                  <p>Réservation max: {{ rule.conditions.maxAdvanceBooking }} jours à l'avance</p>
                }
                @if (rule.conditions.maxActiveReservations) {
                  <p>Réservations actives max: {{ rule.conditions.maxActiveReservations }}</p>
                }
                <p>Approbation admin: {{ rule.conditions.requiresAdminApproval ? 'Oui' : 'Non' }}</p>
              </div>
            </div>
          }
        </div>

        <button class="add-btn" (click)="showForm()">Ajouter une règle</button>

        @if (showingForm) {
          <div class="modal-overlay" (click)="hideForm()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>{{ editingRule ? 'Modifier la règle' : 'Nouvelle règle' }}</h3>
              
              <form [formGroup]="ruleForm" (ngSubmit)="saveRule()">
                <div class="form-group">
                  <label for="name">Nom de la règle:</label>
                  <input type="text" id="name" formControlName="name">
                </div>

                <div class="form-group">
                  <label for="resourceType">Type de ressource:</label>
                  <select id="resourceType" formControlName="resourceType">
                    <option value="room">Salles</option>
                    <option value="vehicle">Véhicules</option>
                    <option value="all">Tous</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="maxDuration">Durée maximale (heures):</label>
                  <input type="number" id="maxDuration" formControlName="maxDuration">
                </div>

                <div class="form-group">
                  <label for="minAdvanceBooking">Réservation minimum (jours):</label>
                  <input type="number" id="minAdvanceBooking" formControlName="minAdvanceBooking">
                </div>

                <div class="form-group">
                  <label for="maxAdvanceBooking">Réservation maximum (jours):</label>
                  <input type="number" id="maxAdvanceBooking" formControlName="maxAdvanceBooking">
                </div>

                <div class="form-group">
                  <label for="maxActiveReservations">Nombre maximum de réservations actives:</label>
                  <input type="number" id="maxActiveReservations" formControlName="maxActiveReservations">
                </div>

                <div class="form-group">
                  <label>
                    <input type="checkbox" formControlName="requiresAdminApproval">
                    Nécessite une approbation administrative
                  </label>
                </div>

                <div class="form-actions">
                  <button type="button" class="cancel-btn" (click)="hideForm()">Annuler</button>
                  <button type="submit" [disabled]="!ruleForm.valid">
                    {{ editingRule ? 'Mettre à jour' : 'Créer' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    } @else {
      <p>Accès non autorisé</p>
    }
  `,
  styles: [`
    .rules-admin {
      padding: 20px;
    }
    .rules-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .rule-card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .rule-card.inactive {
      opacity: 0.7;
      background: #f5f5f5;
    }
    .rule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .rule-actions {
      display: flex;
      gap: 8px;
    }
    .rule-details {
      font-size: 0.9rem;
      color: #666;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
    }
    .form-group input,
    .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .edit-btn {
      background: #2196F3;
      color: white;
    }
    .activate-btn {
      background: #4CAF50;
      color: white;
    }
    .deactivate-btn {
      background: #f44336;
      color: white;
    }
    .add-btn {
      background: #4CAF50;
      color: white;
      margin-top: 20px;
    }
    .cancel-btn {
      background: #f44336;
      color: white;
    }
  `]
})
export class RulesAdminComponent implements OnInit {
  rules: ValidationRule[] = [];
  showingForm = false;
  editingRule: ValidationRule | null = null;
  ruleForm: FormGroup;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private dbService: DatabaseService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.ruleForm = this.createRuleForm();
  }

  ngOnInit() {
    this.loadRules();
  }

  private createRuleForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      resourceType: ['room', Validators.required],
      maxDuration: [null],
      minAdvanceBooking: [null],
      maxAdvanceBooking: [null],
      maxActiveReservations: [null],
      requiresAdminApproval: [false]
    });
  }

  loadRules() {
    this.dbService.getRules().subscribe(rules => {
      this.rules = rules;
    });
  }

  showForm() {
    this.showingForm = true;
    this.editingRule = null;
    this.ruleForm.reset({
      resourceType: 'room',
      requiresAdminApproval: false
    });
  }

  hideForm() {
    this.showingForm = false;
    this.editingRule = null;
  }

  editRule(rule: ValidationRule) {
    this.editingRule = rule;
    this.ruleForm.patchValue({
      name: rule.name,
      resourceType: rule.resourceType,
      maxDuration: rule.conditions.maxDuration,
      minAdvanceBooking: rule.conditions.minAdvanceBooking,
      maxAdvanceBooking: rule.conditions.maxAdvanceBooking,
      maxActiveReservations: rule.conditions.maxActiveReservations,
      requiresAdminApproval: rule.conditions.requiresAdminApproval
    });
    this.showingForm = true;
  }

  saveRule() {
    if (this.ruleForm.valid) {
      const formValue = this.ruleForm.value;
      const rule: Partial<ValidationRule> = {
        name: formValue.name,
        resourceType: formValue.resourceType,
        conditions: {
          maxDuration: formValue.maxDuration,
          minAdvanceBooking: formValue.minAdvanceBooking,
          maxAdvanceBooking: formValue.maxAdvanceBooking,
          maxActiveReservations: formValue.maxActiveReservations,
          requiresAdminApproval: formValue.requiresAdminApproval
        },
        isActive: true
      };

      if (this.editingRule) {
        this.dbService.updateRule(this.editingRule.id, rule).subscribe(() => {
          this.loadRules();
          this.hideForm();
        });
      } else {
        this.dbService.addRule(rule as ValidationRule).subscribe(() => {
          this.loadRules();
          this.hideForm();
        });
      }
    }
  }

  toggleRuleStatus(rule: ValidationRule) {
    this.dbService.updateRule(rule.id, { isActive: !rule.isActive }).subscribe(() => {
      this.loadRules();
    });
  }

  getResourceTypeLabel(type: string): string {
    const labels = {
      'room': 'Salles',
      'vehicle': 'Véhicules',
      'all': 'Tous'
    };
    return labels[type] || type;
  }
}