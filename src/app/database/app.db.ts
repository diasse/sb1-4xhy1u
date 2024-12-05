import Dexie, { Table } from 'dexie';
import { User } from '../models/user.model';
import { Room } from '../models/room.model';
import { Vehicle } from '../models/vehicle.model';
import { Reservation } from '../models/reservation.model';
import { ModificationHistory } from '../models/modification-history.model';
import { ValidationRule } from '../models/validation-rule.model';

export class AppDB extends Dexie {
  users!: Table<User, number>;
  rooms!: Table<Room, number>;
  vehicles!: Table<Vehicle, number>;
  reservations!: Table<Reservation, number>;
  history!: Table<ModificationHistory, number>;
  rules!: Table<ValidationRule, number>;

  constructor() {
    super('ReservationDB');
    
    this.version(1).stores({
      users: '++id, email, role',
      rooms: '++id, name',
      vehicles: '++id, licensePlate',
      reservations: '++id, userId, resourceId, resourceType, status',
      history: '++id, reservationId, userId, timestamp',
      rules: '++id, resourceType, isActive'
    });

    this.on('populate', () => this.populate());
  }

  async populate() {
    // Utilisateurs par défaut
    await this.users.bulkAdd([
      { id: 1, email: 'admin@example.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin' },
      { id: 2, email: 'user@example.com', password: 'user123', firstName: 'Normal', lastName: 'User', role: 'user' },
      { id: 3, email: 'user2@example.com', password: 'user123', firstName: 'John', lastName: 'Doe', role: 'user' }
    ]);

    // Salles par défaut
    await this.rooms.bulkAdd([
      { id: 1, name: 'Salle A', capacity: 10, isAvailable: true },
      { id: 2, name: 'Salle B', capacity: 20, isAvailable: true }
    ]);

    // Véhicules par défaut
    await this.vehicles.bulkAdd([
      { id: 1, brand: 'Renault', model: 'Clio', licensePlate: 'AB-123-CD', isAvailable: true, seats: 5 },
      { id: 2, brand: 'Peugeot', model: '308', licensePlate: 'EF-456-GH', isAvailable: true, seats: 5 }
    ]);
  }
}