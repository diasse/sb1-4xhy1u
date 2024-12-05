import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h2>Nouvelle Réservation</h2>
        <form [formGroup]="reservationForm" (ngSubmit)="onSubmit()">
          @if (isAdmin) {
            <div class="form-group">
              <label for="userId">Utilisateur:</label>
              <select id="userId" formControlName="userId">
                <option value="">Sélectionner un utilisateur</option>
                @for (user of users; track user.id) {
                  <option [value]="user.id">{{ user.firstName }} {{ user.lastName }}</option>
                }
              </select>
            </div>
          }

          <div class="form-group">
            <label for="startDate">Date de début:</label>
            <input type="datetime-local" id="startDate" formControlName="startDate">
          </div>

          <div class="form-group">
            <label for="endDate">Date de fin:</label>
            <input type="datetime-local" id="endDate" formControlName="endDate">
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" (click)="close.emit()">Annuler</button>
            <button type="submit" [disabled]="!reservationForm.valid">Réserver</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
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
      padding: 2rem;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
    }
    input, select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button[type="submit"] {
      background: #4CAF50;
      color: white;
    }
    .cancel-btn {
      background: #dc3545;
      color: white;
    }
    button:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }
  `]
})
export class ReservationFormComponent {
  @Input() resourceId!: number;
  @Input() resourceType!: 'room' | 'vehicle';
  @Input() close!: () => void;

  reservationForm: FormGroup;
  isAdmin = false;
  users: User[] = [];

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
    this.reservationForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      userId: [this.authService.getCurrentUser()?.id]
    });

    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  loadUsers() {
    this.authService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      const formValue = this.reservationForm.value;
      const reservation = {
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        userId: formValue.userId || this.authService.getCurrentUser()?.id,
        resourceId: this.resourceId,
        resourceType: this.resourceType,
        status: 'pending'
      };

      this.reservationService.createReservation(reservation).subscribe(() => {
        this.close();
      });
    }
  }
}