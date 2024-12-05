export interface Room {
  id: number;
  name: string;
  capacity: number;
  isAvailable: boolean;
  description?: string;
}