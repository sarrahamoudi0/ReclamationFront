export interface Categorie {
    idCategorie?: string;
    nomCategorie: string;
    sousCategories: Categorie[];
    
  }