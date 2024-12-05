import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ReservationFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  resourceType?: 'room' | 'vehicle' | '';
}

@Component({
  selector: 'app-reservation-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-container">
      <div class="filter-group">
        <label for="status">Statut:</label>
        <select id="status" [(ngModel)]="filters.status" (ngModelChange)="applyFilters()">
          <option value="">Tous</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvé</option>
          <option value="rejected">Rejeté</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="resourceType">Type:</label>
        <select id="resourceType" [(ngModel)]="filters.resourceType" (ngModelChange)="applyFilters()">
          <option value="">Tous</option>
          <option value="room">Salle</option>
          <option value="vehicle">Véhicule</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="startDate">Date début:</label>
        <input 
          type="date" 
          id="startDate" 
          [(ngModel)]="filters.startDate" 
          (ngModelChange)="applyFilters()"
        >
      </div>

      <div class="filter-group">
        <label for="endDate">Date fin:</label>
        <input 
          type="date" 
          id="endDate" 
          [(ngModel)]="filters.endDate" 
          (ngModelChange)="applyFilters()"
        >
      </div>
    </div>
  `,
  styles: [`
    .filters-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    select, input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-width: 150px;
    }
  `]
})
export class ReservationFiltersComponent {
  @Output() filtersChange = new EventEmitter<ReservationFilters>();

  filters: ReservationFilters = {};

  applyFilters() {
    this.filtersChange.emit(this.filters);
  }
}