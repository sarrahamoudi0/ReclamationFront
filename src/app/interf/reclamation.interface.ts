import { Priorite } from "../models/Priorite";
import { Statut } from "../models/Statut";

interface ITypeReclamation {
    chiffre: number;
    reclamationPriorite : Priorite;
    reclamationStatut : Statut;
  }
  
  export { ITypeReclamation };