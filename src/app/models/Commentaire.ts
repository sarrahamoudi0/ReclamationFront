import { User } from './User';
import { Reclamation } from './Reclamation';

export class Commentaire {
  idCommentaire?: string;
  contenu!: string;
  dateCommentaire?: Date;
  user?: User;
  reclamation?: Reclamation;
  interne?: boolean;


}