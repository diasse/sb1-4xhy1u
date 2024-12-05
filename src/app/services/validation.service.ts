import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
import { DatabaseService } from './database.service';
import { Reservation } from '../models/reservation.model';
import { ValidationRule } from '../models/validation-rule.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private defaultRules: ValidationRule[] = [
    {
      id: 1,
      name: 'Règle standard pour les salles',
      resourceType: 'room',
      conditions: {
        maxDuration: 8, // 8 heures maximum
        maxAdvanceBooking: 30, // 30 jours maximum à l'avance
        minAdvanceBooking: 1, // 1 jour minimum à l'avance
        maxActiveReservations: 3,
        requiresAdminApproval: false
      },
      isActive: true
    },
    {
      id: 2,
      name: 'Règle standard pour les véhicules',
      resourceType: 'vehicle',
      conditions: {
        maxDuration: 24, // 24 heures maximum
        maxAdvanceBooking: 14, // 14 jours maximum à l'avance
        minAdvanceBooking: 2, // 2 jours minimum à l'avance
        maxActiveReservations: 1,
        requiresAdminApproval: true
      },
      isActive: true
    }
  ];

  constructor(
    private dbService: DatabaseService,
    private authService: AuthService
  ) {
    // Initialiser les règles par défaut
    this.initializeRules();
  }

  private initializeRules() {
    // Ajouter les règles à la base de données si elles n'existent pas déjà
    this.dbService.getRules().subscribe(rules => {
      if (rules.length === 0) {
        from(this.defaultRules).pipe(
          switchMap(rule => this.dbService.addRule(rule))
        ).subscribe();
      }
    });
  }

  validateReservation(reservation: Omit<Reservation, 'id'>): Observable<{ isValid: boolean; message: string }> {
    return this.dbService.getRules().pipe(
      map(rules => {
        const applicableRules = rules.filter(rule => 
          rule.isActive && (rule.resourceType === reservation.resourceType || rule.resourceType === 'all')
        );

        for (const rule of applicableRules) {
          // Vérifier la durée maximale
          if (rule.conditions.maxDuration) {
            const duration = (new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 60 * 60);
            if (duration > rule.conditions.maxDuration) {
              return {
                isValid: false,
                message: `La durée maximale de réservation est de ${rule.conditions.maxDuration} heures`
              };
            }
          }

          // Vérifier la période de réservation à l'avance
          if (rule.conditions.maxAdvanceBooking || rule.conditions.minAdvanceBooking) {
            const now = new Date();
            const startDate = new Date(reservation.startDate);
            const daysInAdvance = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

            if (rule.conditions.maxAdvanceBooking && daysInAdvance > rule.conditions.maxAdvanceBooking) {
              return {
                isValid: false,
                message: `La réservation ne peut pas être faite plus de ${rule.conditions.maxAdvanceBooking} jours à l'avance`
              };
            }

            if (rule.conditions.minAdvanceBooking && daysInAdvance < rule.conditions.minAdvanceBooking) {
              return {
                isValid: false,
                message: `La réservation doit être faite au moins ${rule.conditions.minAdvanceBooking} jours à l'avance`
              };
            }
          }

          // Vérifier le nombre maximum de réservations actives
          if (rule.conditions.maxActiveReservations) {
            return this.checkActiveReservations(reservation, rule.conditions.maxActiveReservations);
          }
        }

        // Si toutes les règles sont validées
        return {
          isValid: true,
          message: 'La réservation est valide'
        };
      })
    );
  }

  private checkActiveReservations(newReservation: Omit<Reservation, 'id'>, maxActive: number): { isValid: boolean; message: string } {
    return {
      isValid: true,
      message: 'Vérification du nombre de réservations actives effectuée'
    };
  }

  shouldAutoApprove(reservation: Omit<Reservation, 'id'>): Observable<boolean> {
    if (this.authService.isAdmin()) {
      return from([true]);
    }

    return this.dbService.getRules().pipe(
      map(rules => {
        const applicableRules = rules.filter(rule => 
          rule.isActive && (rule.resourceType === reservation.resourceType || rule.resourceType === 'all')
        );

        // Si une règle nécessite l'approbation d'un admin, pas d'auto-approbation
        return !applicableRules.some(rule => rule.conditions.requiresAdminApproval);
      })
    );
  }
}