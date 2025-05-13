export class SousCategorie {
  idSousCategorie!: string;
  nomSousCategorie: string;
  categorieParentId: string;

  constructor(idSousCategorie: string, nomSousCategorie: string, categorieParentId: string) {
    this.idSousCategorie = idSousCategorie;
    this.nomSousCategorie = nomSousCategorie;
    this.categorieParentId = categorieParentId;
  }
}
