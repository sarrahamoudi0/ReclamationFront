import { Priorite } from "./Priorite";
import { Statut } from "./Statut";
import { User } from "./User";

export class Reclamation {
    idReclamation?: string; 

    titre!: string;
    description!: string;
    createdDate?: Date | null; 
    image_reclamation?: File | null; 
    url?: string | ArrayBuffer;
    statut!: Statut;
    priorite!: Priorite;
    user?: User;

    
  }
  