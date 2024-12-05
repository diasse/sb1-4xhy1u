export interface ValidationRule {
  id: number;
  name: string;
  resourceType: 'room' | 'vehicle' | 'all';
  conditions: {
    maxDuration?: number; // en heures
    maxAdvanceBooking?: number; // en jours
    minAdvanceBooking?: number; // en jours
    blackoutDates?: Date[];
    maxActiveReservations?: number;
    requiresAdminApproval?: boolean;
  };
  isActive: boolean;
}