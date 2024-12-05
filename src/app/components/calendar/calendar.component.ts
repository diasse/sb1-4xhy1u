import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  template: `
    <div class="calendar-container">
      <h2>Calendrier des réservations</h2>
      <full-calendar [options]="calendarOptions"></full-calendar>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 20px;
    }
    :host ::ng-deep .fc {
      max-width: 100%;
      background: white;
    }
  `]
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    locale: 'fr'
  };

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.reservationService.getReservations().subscribe(reservations => {
      const events: EventInput[] = reservations.map(reservation => ({
        id: reservation.id.toString(),
        title: `${reservation.resourceType === 'room' ? 'Salle' : 'Véhicule'} #${reservation.resourceId}`,
        start: reservation.startDate,
        end: reservation.endDate,
        backgroundColor: this.getStatusColor(reservation.status)
      }));
      
      this.calendarOptions.events = events;
    });
  }

  private getStatusColor(status: string): string {
    switch(status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'rejected': return '#f44336';
      default: return '#2196F3';
    }
  }

  handleEventClick(info: any) {
    console.log('Event clicked:', info.event);
  }
}