import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Map<number, string[]> = new Map();

  sendReservationNotification(user: User, reservation: Reservation, type: 'create' | 'update' | 'cancel' | 'approve' | 'reject'): Observable<boolean> {
    const message = this.createNotificationMessage(type, reservation);
    const userNotifications = this.notifications.get(user.id) || [];
    userNotifications.push(message);
    this.notifications.set(user.id, userNotifications);
    
    // Simuler l'envoi d'un email
    console.log(`Email envoyé à ${user.email}: ${message}`);
    return of(true);
  }

  getUserNotifications(userId: number): Observable<string[]> {
    return of(this.notifications.get(userId) || []);
  }

  private createNotificationMessage(type: string, reservation: Reservation): string {
    const resourceType = reservation.resourceType === 'room' ? 'salle' : 'véhicule';
    const date = new Date(reservation.startDate).toLocaleDateString();
    
    switch(type) {
      case 'create':
        return `Nouvelle réservation de ${resourceType} créée pour le ${date}`;
      case 'update':
        return `Réservation de ${resourceType} modifiée pour le ${date}`;
      case 'cancel':
        return `Réservation de ${resourceType} annulée pour le ${date}`;
      case 'approve':
        return `Réservation de ${resourceType} approuvée pour le ${date}`;
      case 'reject':
        return `Réservation de ${resourceType} rejetée pour le ${date}`;
      default:
        return `Mise à jour de la réservation de ${resourceType} pour le ${date}`;
    }
  }
}