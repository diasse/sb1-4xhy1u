import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ModificationHistory } from '../models/modification-history.model';
import { DatabaseService } from './database.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  constructor(
    private dbService: DatabaseService,
    private authService: AuthService
  ) {}

  addToHistory(
    reservationId: number,
    action: 'create' | 'update' | 'cancel' | 'approve' | 'reject',
    details: string
  ): Observable<number> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) throw new Error('Utilisateur non connecté');

    const historyEntry: Omit<ModificationHistory, 'id'> = {
      reservationId,
      userId: currentUser.id,
      action,
      timestamp: new Date(),
      details
    };

    return this.dbService.addHistory(historyEntry);
  }

  getAllHistory(): Observable<ModificationHistory[]> {
    return this.dbService.getHistory();
  }
}