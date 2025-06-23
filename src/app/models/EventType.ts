import { User } from './User';
import { Reclamation } from './Reclamation';

export enum EventType {
  CREATION = 'CREATION',
  STATUT_CHANGER = 'STATUT_CHANGER',
  PRIORITE_CHANGER = 'PRIORITE_CHANGER',
  MODIFICATION = 'MODIFICATION',
  CATEGORIE_CHANGER = 'CATEGORIE_CHANGER',
  TITRE_CHANGER = 'TITRE_CHANGER',
  DESCRIPTION_CHANGER = 'DESCRIPTION_CHANGER',
  IMAGE_CHANGER = 'IMAGE_CHANGER',
  COMMENTAIRE_AJOUTER = 'COMMENTAIRE_AJOUTER',
}

export interface ReclamationEvent {
    id: string;
    acteur: User;
    reclamation: Reclamation;
    type: EventType;
    description: string;
    timestamp: string; 
  }