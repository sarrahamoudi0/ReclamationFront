import { Priorite } from "./Priorite";
import { Statut } from "./Statut";

export class Reclamation {
    idReclamation?: string; 
    nom!: string;
    prenom!: string;
    email!: string;
    num!: string;
    titre!: string;
    description!: string;
    createdDate?: Date | null; 
    image_reclamation!: File | null; 
    url?: string | ArrayBuffer;
    statut!: Statut;
    priorite!: Priorite;

  }
  