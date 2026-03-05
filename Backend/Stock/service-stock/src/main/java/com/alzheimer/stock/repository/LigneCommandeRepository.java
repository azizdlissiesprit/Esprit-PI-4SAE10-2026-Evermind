package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.LigneCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Long> {

    @Modifying
    @Query("UPDATE LigneCommande lc SET lc.produit = NULL WHERE lc.produit.id = :produitId")
    void nullifyProduitReference(@Param("produitId") Long produitId);
}
