export interface Produit {
  id?: number;
  nom: string;
  description: string;
  prix: number;
  quantite: number;
  categorieId: number;
  categorieNom?: string;
  dateCreation?: string;
  dateModification?: string;
}
