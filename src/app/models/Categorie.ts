import { SousCategorie } from "./SousCategorie";

export interface Categorie {
    idCategorie?: string;
    nomCategorie: string;
    sousCategories: SousCategorie[];

  }
