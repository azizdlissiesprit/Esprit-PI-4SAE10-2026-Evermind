import { Categorie } from './categorie.model';
import { Commande } from './commande.model';
import { Produit } from './produit.model';

export interface TableauDeBord {
  totalCategories: number;
  totalProduits: number;
  produitsStockBas: number;
  produitsEnRupture: number;
  valeurTotaleStock: number;
  dernieresCategories: Categorie[];
  derniersProduits: Produit[];
  totalCommandes: number;
  commandesEnAttente: number;
  chiffreAffaires: number;
  dernieresCommandes: Commande[];
}
