import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RoomListComponent } from './app/components/room-list/room-list.component';
import { VehicleListComponent } from './app/components/vehicle-list/vehicle-list.component';
import { LoginComponent } from './app/components/login/login.component';
import { ReservationListComponent } from './app/components/reservation-list/reservation-list.component';
import { CalendarComponent } from './app/components/calendar/calendar.component';
import { StatisticsComponent } from './app/components/statistics/statistics.component';
import { RulesAdminComponent } from './app/components/rules-admin/rules-admin.component';
import { AuthService } from './app/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RoomListComponent, 
    VehicleListComponent, 
    LoginComponent, 
    ReservationListComponent,
    CalendarComponent,
    StatisticsComponent,
    RulesAdminComponent
  ],
  template: `
    <div class="app-container">
      @if (!authService.isAuthenticated()) {
        <app-login></app-login>
      } @else {
        <header>
          <h1>Système de Réservation</h1>
          <div class="user-info">
            <span>{{ getUserInfo() }}</span>
            <button (click)="logout()" class="logout-btn">Déconnexion</button>
          </div>
        </header>
        
        <main>
          <app-calendar></app-calendar>
          <app-room-list></app-room-list>
          <app-vehicle-list></app-vehicle-list>
          <app-reservation-list></app-reservation-list>
          <app-statistics></app-statistics>
          @if (authService.isAdmin()) {
            <app-rules-admin></app-rules-admin>
          }
        </main>
      }
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background: #2196F3;
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    main {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .logout-btn {
      padding: 8px 16px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class App {
  constructor(public authService: AuthService) {}

  getUserInfo(): string {
    const user = this.authService.getCurrentUser();
    return `${user?.firstName} ${user?.lastName} (${user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'})`;
  }

  logout() {
    this.authService.logout();
  }
}

bootstrapApplication(App);