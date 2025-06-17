import { User } from './User';
import { Reclamation } from './Reclamation';

export enum EventType {
  CREATION = 'CREATION',
  STATUT_CHANGE = 'STATUT_CHANGE',
  PRIORITE_CHANGE = 'PRIORITE_CHANGE',
  MODIFICATION = 'MODIFICATION',
  CATEGORIE_CHANGE = 'CATEGORIE_CHANGE',
  TITRE_CHANGE = 'TITRE_CHANGE',
  DESCRIPTION_CHANGE = 'DESCRIPTION_CHANGE',
  IMAGE_CHANGE = 'IMAGE_CHANGE',
  COMMENTAIRE_AJOUT = 'COMMENTAIRE_AJOUT',
}

export interface ReclamationEvent {
    id: string;
    acteur: User;
    reclamation: Reclamation;
    type: EventType;
    description: string;
    timestamp: string; 
  }