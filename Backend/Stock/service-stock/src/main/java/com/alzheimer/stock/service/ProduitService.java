package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.ProduitDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProduitService {

    List<ProduitDTO> listerTousLesProduits();

    List<ProduitDTO> listerProduitsParCategorie(Long categorieId);

    ProduitDTO obtenirProduitParId(Long id);

    ProduitDTO creerProduit(ProduitDTO produitDTO);

    ProduitDTO modifierProduit(Long id, ProduitDTO produitDTO);

    void supprimerProduit(Long id);

    ProduitDTO uploaderImage(Long id, MultipartFile fichier);

    ProduitDTO supprimerImage(Long id);

    List<ProduitDTO> obtenirProduitsCrossSell(Long produitId);
}
