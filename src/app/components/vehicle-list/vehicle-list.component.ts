import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { Vehicle } from '../../models/vehicle.model';
import { ReservationFormComponent } from '../reservation-form/reservation-form.component';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, ReservationFormComponent],
  template: `
    <div class="container">
      <h2>Véhicules disponibles</h2>
      <div class="vehicle-grid">
        @for (vehicle of vehicles; track vehicle.id) {
          <div class="vehicle-card">
            <h3>{{ vehicle.brand }} {{ vehicle.model }}</h3>
            <p>Immatriculation: {{ vehicle.licensePlate }}</p>
            <p>Places: {{ vehicle.seats }}</p>
            <p>Status: {{ vehicle.isAvailable ? 'Disponible' : 'Occupé' }}</p>
            <button 
              [disabled]="!vehicle.isAvailable"
              (click)="showReservationForm(vehicle.id)"
            >
              Réserver
            </button>
          </div>
        }
      </div>

      @if (showingReservationForm) {
        <app-reservation-form
          [resourceId]="selectedResourceId"
          resourceType="vehicle"
          [close]="closeReservationForm"
        />
      }
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .vehicle-grid { 
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .vehicle-card {
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
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  showingReservationForm = false;
  selectedResourceId: number = 0;

  constructor(private reservationService: ReservationService) {
    this.closeReservationForm = this.closeReservationForm.bind(this);
  }

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.reservationService.getVehicles().subscribe(
      vehicles => this.vehicles = vehicles
    );
  }

  showReservationForm(vehicleId: number) {
    this.selectedResourceId = vehicleId;
    this.showingReservationForm = true;
  }

  closeReservationForm() {
    this.showingReservationForm = false;
    this.loadVehicles(); // Recharger la liste pour mettre à jour les disponibilités
  }
}