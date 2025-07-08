import { User } from "./User";

export interface Notification {
  id?: string;
  message: string;
  date: string; 
  vue: boolean;
  status: 'NON_LUE' | 'LUE';
  destinataire?: User;
  actionPar?: User;
  reclamationId: string;
}