import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { ReservationService } from '../../services/reservation.service';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `
    <div class="stats-container">
      <h2>Statistiques d'utilisation</h2>
      
      <div class="charts-grid">
        <div class="chart-card">
          <h3>Réservations par type</h3>
          <canvas baseChart
            [data]="resourceTypeData"
            [options]="pieChartOptions"
            [type]="'pie'">
          </canvas>
        </div>

        <div class="chart-card">
          <h3>Statut des réservations</h3>
          <canvas baseChart
            [data]="statusData"
            [options]="pieChartOptions"
            [type]="'pie'">
          </canvas>
        </div>

        <div class="chart-card">
          <h3>Réservations par mois</h3>
          <canvas baseChart
            [data]="monthlyData"
            [options]="barChartOptions"
            [type]="'bar'">
          </canvas>
        </div>
      </div>

      <div class="history-section">
        <h3>Historique des modifications</h3>
        <div class="history-list">
          @for (entry of historyEntries; track entry.id) {
            <div class="history-item">
              <span class="timestamp">{{ entry.timestamp | date:'short' }}</span>
              <span class="action">{{ getActionLabel(entry.action) }}</span>
              <span class="details">{{ entry.details }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      padding: 20px;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .chart-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .history-section {
      margin-top: 2rem;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .history-list {
      margin-top: 1rem;
    }
    .history-item {
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
      display: grid;
      grid-template-columns: auto auto 1fr;
      gap: 1rem;
      align-items: center;
    }
    .timestamp {
      color: #666;
      font-size: 0.9rem;
    }
    .action {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.8rem;
    }
    .details {
      color: #333;
    }
  `]
})
export class StatisticsComponent implements OnInit {
  resourceTypeData = {
    labels: ['Salles', 'Véhicules'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#FF6384', '#36A2EB']
    }]
  };

  statusData = {
    labels: ['En attente', 'Approuvé', 'Rejeté'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#FFC107', '#4CAF50', '#f44336']
    }]
  };

  monthlyData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [{
      label: 'Nombre de réservations',
      data: Array(12).fill(0),
      backgroundColor: '#2196F3'
    }]
  };

  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  historyEntries: any[] = [];

  constructor(
    private reservationService: ReservationService,
    private historyService: HistoryService
  ) {}

  ngOnInit() {
    this.loadStatistics();
    this.loadHistory();
  }

  loadStatistics() {
    this.reservationService.getReservations().subscribe(reservations => {
      // Statistiques par type
      const roomCount = reservations.filter(r => r.resourceType === 'room').length;
      const vehicleCount = reservations.filter(r => r.resourceType === 'vehicle').length;
      this.resourceTypeData.datasets[0].data = [roomCount, vehicleCount];

      // Statistiques par statut
      const pendingCount = reservations.filter(r => r.status === 'pending').length;
      const approvedCount = reservations.filter(r => r.status === 'approved').length;
      const rejectedCount = reservations.filter(r => r.status === 'rejected').length;
      this.statusData.datasets[0].data = [pendingCount, approvedCount, rejectedCount];

      // Statistiques mensuelles
      const monthlyStats = Array(12).fill(0);
      reservations.forEach(reservation => {
        const month = new Date(reservation.startDate).getMonth();
        monthlyStats[month]++;
      });
      this.monthlyData.datasets[0].data = monthlyStats;
    });
  }

  loadHistory() {
    this.historyService.getAllHistory().subscribe(history => {
      this.historyEntries = history.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
  }

  getActionLabel(action: string): string {
    const labels = {
      'create': 'Création',
      'update': 'Modification',
      'cancel': 'Annulation',
      'approve': 'Approbation',
      'reject': 'Rejet'
    };
    return labels[action] || action;
  }
}