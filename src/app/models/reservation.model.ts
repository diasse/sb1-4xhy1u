export interface Reservation {
  id: number;
  startDate: Date;
  endDate: Date;
  userId: number;
  resourceId: number;
  resourceType: 'room' | 'vehicle';
  status: 'pending' | 'approved' | 'rejected';
}