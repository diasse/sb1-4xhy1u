import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { Room } from '../../models/room.model';
import { ReservationFormComponent } from '../reservation-form/reservation-form.component';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, ReservationFormComponent],
  template: `
    <div class="container">
      <h2>Salles disponibles</h2>
      <div class="room-grid">
        @for (room of rooms; track room.id) {
          <div class="room-card">
            <h3>{{ room.name }}</h3>
            <p>Capacité: {{ room.capacity }} personnes</p>
            <p>Status: {{ room.isAvailable ? 'Disponible' : 'Occupée' }}</p>
            <button 
              [disabled]="!room.isAvailable" 
              (click)="showReservationForm(room.id)"
            >
              Réserver
            </button>
          </div>
        }
      </div>

      @if (showingReservationForm) {
        <app-reservation-form
          [resourceId]="selectedResourceId"
          resourceType="room"
          [close]="closeReservationForm"
        />
      }
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .room-grid { 
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .room-card {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
    }
    button {
      padding: 8px 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }
  `]
})
export class RoomListComponent implements OnInit {
  rooms: Room[] = [];
  showingReservationForm = false;
  selectedResourceId: number = 0;

  constructor(private reservationService: ReservationService) {
    this.closeReservationForm = this.closeReservationForm.bind(this);
  }

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.reservationService.getRooms().subscribe(
      rooms => this.rooms = rooms
    );
  }

  showReservationForm(roomId: number) {
    this.selectedResourceId = roomId;
    this.showingReservationForm = true;
  }

  closeReservationForm() {
    this.showingReservationForm = false;
    this.loadRooms(); // Recharger la liste pour mettre à jour les disponibilités
  }
}