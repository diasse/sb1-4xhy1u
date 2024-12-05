import { Injectable } from '@angular/core';
import { AppDB } from '../database/app.db';
import { from, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Room } from '../models/room.model';
import { Vehicle } from '../models/vehicle.model';
import { Reservation } from '../models/reservation.model';
import { ModificationHistory } from '../models/modification-history.model';
import { ValidationRule } from '../models/validation-rule.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: AppDB;

  constructor() {
    this.db = new AppDB();
  }

  // Users
  getUsers(): Observable<User[]> {
    return from(this.db.users.toArray());
  }

  getUserByEmail(email: string): Observable<User | undefined> {
    return from(this.db.users.where('email').equals(email).first());
  }

  // Rooms
  getRooms(): Observable<Room[]> {
    return from(this.db.rooms.toArray());
  }

  updateRoomAvailability(id: number, isAvailable: boolean): Observable<number> {
    return from(this.db.rooms.update(id, { isAvailable }));
  }

  // Vehicles
  getVehicles(): Observable<Vehicle[]> {
    return from(this.db.vehicles.toArray());
  }

  updateVehicleAvailability(id: number, isAvailable: boolean): Observable<number> {
    return from(this.db.vehicles.update(id, { isAvailable }));
  }

  // Reservations
  getReservations(): Observable<Reservation[]> {
    return from(this.db.reservations.toArray());
  }

  addReservation(reservation: Omit<Reservation, 'id'>): Observable<number> {
    return from(this.db.reservations.add(reservation as Reservation));
  }

  updateReservationStatus(id: number, status: 'approved' | 'rejected'): Observable<number> {
    return from(this.db.reservations.update(id, { status }));
  }

  deleteReservation(id: number): Observable<void> {
    return from(this.db.reservations.delete(id));
  }

  // History
  addHistory(history: Omit<ModificationHistory, 'id'>): Observable<number> {
    return from(this.db.history.add(history as ModificationHistory));
  }

  getHistory(): Observable<ModificationHistory[]> {
    return from(this.db.history.orderBy('timestamp').reverse().toArray());
  }

  // Validation Rules
  getRules(): Observable<ValidationRule[]> {
    return from(this.db.rules.toArray());
  }

  addRule(rule: ValidationRule): Observable<number> {
    return from(this.db.rules.add(rule));
  }

  updateRule(id: number, rule: Partial<ValidationRule>): Observable<number> {
    return from(this.db.rules.update(id, rule));
  }
}