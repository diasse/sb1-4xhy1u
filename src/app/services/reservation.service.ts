import { Injectable } from '@angular/core';
import { Observable, switchMap, tap, of } from 'rxjs';
import { Reservation } from '../models/reservation.model';
import { Room } from '../models/room.model';
import { Vehicle } from '../models/vehicle.model';
import { DatabaseService } from './database.service';
import { HistoryService } from './history.service';
import { ValidationService } from './validation.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  constructor(
    private dbService: DatabaseService,
    private historyService: HistoryService,
    private validationService: ValidationService
  ) {}

  getRooms(): Observable<Room[]> {
    return this.dbService.getRooms();
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.dbService.getVehicles();
  }

  getReservations(): Observable<Reservation[]> {
    return this.dbService.getReservations();
  }

  createReservation(reservation: Omit<Reservation, 'id'>): Observable<number> {
    return this.validationService.validateReservation(reservation).pipe(
      switchMap(validation => {
        if (!validation.isValid) {
          throw new Error(validation.message);
        }

        return this.validationService.shouldAutoApprove(reservation).pipe(
          switchMap(shouldAutoApprove => {
            const finalReservation = {
              ...reservation,
              status: shouldAutoApprove ? 'approved' : 'pending'
            };

            return this.dbService.addReservation(finalReservation).pipe(
              tap(id => {
                this.updateResourceAvailability(finalReservation.resourceId, finalReservation.resourceType, false);
                this.historyService.addToHistory(
                  id,
                  'create',
                  `Nouvelle réservation créée (${shouldAutoApprove ? 'auto-approuvée' : 'en attente'})`
                );
              })
            );
          })
        );
      })
    );
  }

  cancelReservation(id: number): Observable<void> {
    return this.getReservations().pipe(
      switchMap(reservations => {
        const reservation = reservations.find(r => r.id === id);
        if (reservation) {
          this.updateResourceAvailability(reservation.resourceId, reservation.resourceType, true);
          return this.dbService.deleteReservation(id);
        }
        throw new Error('Réservation non trouvée');
      }),
      tap(() => {
        this.historyService.addToHistory(id, 'cancel', 'Réservation annulée');
      })
    );
  }

  updateReservationStatus(id: number, status: 'approved' | 'rejected'): Observable<number> {
    return this.dbService.updateReservationStatus(id, status).pipe(
      tap(() => {
        this.historyService.addToHistory(
          id,
          status === 'approved' ? 'approve' : 'reject',
          `Réservation ${status === 'approved' ? 'approuvée' : 'rejetée'}`
        );
      })
    );
  }

  private updateResourceAvailability(resourceId: number, resourceType: 'room' | 'vehicle', isAvailable: boolean) {
    if (resourceType === 'room') {
      this.dbService.updateRoomAvailability(resourceId, isAvailable).subscribe();
    } else {
      this.dbService.updateVehicleAvailability(resourceId, isAvailable).subscribe();
    }
  }
}