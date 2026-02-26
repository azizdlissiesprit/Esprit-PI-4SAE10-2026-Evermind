package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.ProduitDTO;
import com.alzheimer.stock.entite.Categorie;
import com.alzheimer.stock.entite.Produit;
import com.alzheimer.stock.exception.ResourceIntrouvableException;
import com.alzheimer.stock.repository.CategorieRepository;
import com.alzheimer.stock.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProduitServiceImpl implements ProduitService {

    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProduitDTO> listerTousLesProduits() {
        return produitRepository.findAll()
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduitDTO> listerProduitsParCategorie(Long categorieId) {
        return produitRepository.findByCategorieId(categorieId)
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProduitDTO obtenirProduitParId(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Produit", "id", id));
        return convertirEnDTO(produit);
    }

    @Override
    public ProduitDTO creerProduit(ProduitDTO produitDTO) {
        Categorie categorie = categorieRepository.findById(produitDTO.getCategorieId())
                .orElseThrow(() -> new ResourceIntrouvableException("Catégorie", "id", produitDTO.getCategorieId()));

        Produit produit = Produit.builder()
                .nom(produitDTO.getNom())
                .description(produitDTO.getDescription())
                .prix(produitDTO.getPrix())
                .quantite(produitDTO.getQuantite())
                .categorie(categorie)
                .build();

        Produit sauvegarde = produitRepository.save(produit);
        return convertirEnDTO(sauvegarde);
    }

    @Override
    public ProduitDTO modifierProduit(Long id, ProduitDTO produitDTO) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Produit", "id", id));

        Categorie categorie = categorieRepository.findById(produitDTO.getCategorieId())
                .orElseThrow(() -> new ResourceIntrouvableException("Catégorie", "id", produitDTO.getCategorieId()));

        produit.setNom(produitDTO.getNom());
        produit.setDescription(produitDTO.getDescription());
        produit.setPrix(produitDTO.getPrix());
        produit.setQuantite(produitDTO.getQuantite());
        produit.setCategorie(categorie);

        Produit modifie = produitRepository.save(produit);
        return convertirEnDTO(modifie);
    }

    @Override
    public void supprimerProduit(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Produit", "id", id));
        produitRepository.delete(produit);
    }

    private ProduitDTO convertirEnDTO(Produit produit) {
        return ProduitDTO.builder()
                .id(produit.getId())
                .nom(produit.getNom())
                .description(produit.getDescription())
                .prix(produit.getPrix())
                .quantite(produit.getQuantite())
                .categorieId(produit.getCategorie().getId())
                .categorieNom(produit.getCategorie().getNom())
                .dateCreation(produit.getDateCreation())
                .dateModification(produit.getDateModification())
                .build();
    }
}
