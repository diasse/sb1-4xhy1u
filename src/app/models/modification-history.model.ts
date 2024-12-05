export interface ModificationHistory {
  id: number;
  reservationId: number;
  userId: number;
  action: 'create' | 'update' | 'cancel' | 'approve' | 'reject';
  timestamp: Date;
  details: string;
}