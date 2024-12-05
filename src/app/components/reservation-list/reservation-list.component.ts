import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { Reservation } from '../../models/reservation.model';
import { ReservationFiltersComponent, ReservationFilters } from '../reservation-filters/reservation-filters.component';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, ReservationFiltersComponent],
  template: `
    <div class="container">
      <h2>Réservations</h2>
      
      <app-reservation-filters
        (filtersChange)="applyFilters($event)"
      />

      <div class="reservation-list">
        @for (reservation of filteredReservations; track reservation.id) {
          <div class="reservation-card">
            <p>Type: {{ reservation.resourceType === 'room' ? 'Salle' : 'Véhicule' }}</p>
            <p>Date début: {{ reservation.startDate | date:'short' }}</p>
            <p>Date fin: {{ reservation.endDate | date:'short' }}</p>
            <p>Statut: {{ reservation.status }}</p>
            
            @if (isAdmin && reservation.status === 'pending') {
              <div class="admin-actions">
                <button 
                  (click)="updateStatus(reservation.id, 'approved')"
                  class="approve-btn"
                >
                  Approuver
                </button>
                <button 
                  (click)="updateStatus(reservation.id, 'rejected')"
                  class="reject-btn"
                >
                  Rejeter
                </button>
              </div>
            }

            @if (canCancelReservation(reservation)) {
              <button (click)="cancelReservation(reservation.id)" class="cancel-btn">
                Annuler
              </button>
            }
          </div>
        }

        @if (filteredReservations.length === 0) {
          <p class="no-results">Aucune réservation trouvée</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .reservation-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .reservation-card {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
    }
    .admin-actions {
      display: flex;
      gap: 0.5rem;
      margin: 1rem 0;
    }
    .approve-btn {
      background: #4CAF50;
      color: white;
    }
    .reject-btn {
      background: #f44336;
      color: white;
    }
    .cancel-btn {
      background: #dc3545;
      color: white;
    }
    button {
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
    }
  `]
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  isAdmin = false;

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.reservationService.getReservations().subscribe(reservations => {
      const currentUser = this.authService.getCurrentUser();
      if (this.isAdmin) {
        this.reservations = reservations;
      } else {
        this.reservations = reservations.filter(r => r.userId === currentUser?.id);
      }
      this.filteredReservations = this.reservations;
    });
  }

  canCancelReservation(reservation: Reservation): boolean {
    const currentUser = this.authService.getCurrentUser();
    return (this.isAdmin || reservation.userId === currentUser?.id) && 
           reservation.status !== 'rejected';
  }

  cancelReservation(id: number) {
    this.reservationService.cancelReservation(id).subscribe(success => {
      if (success) {
        this.loadReservations();
      }
    });
  }

  updateStatus(id: number, status: 'approved' | 'rejected') {
    this.reservationService.updateReservationStatus(id, status).subscribe(() => {
      this.loadReservations();
    });
  }

  applyFilters(filters: ReservationFilters) {
    this.filteredReservations = this.reservations.filter(reservation => {
      let matches = true;

      if (filters.status && reservation.status !== filters.status) {
        matches = false;
      }

      if (filters.resourceType && reservation.resourceType !== filters.resourceType) {
        matches = false;
      }

      if (filters.startDate) {
        const filterDate = new Date(filters.startDate);
        const reservationDate = new Date(reservation.startDate);
        if (reservationDate < filterDate) {
          matches = false;
        }
      }

      if (filters.endDate) {
        const filterDate = new Date(filters.endDate);
        const reservationDate = new Date(reservation.endDate);
        if (reservationDate > filterDate) {
          matches = false;
        }
      }

      return matches;
    });
  }
}