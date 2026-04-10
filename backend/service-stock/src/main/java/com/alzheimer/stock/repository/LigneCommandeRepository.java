package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.LigneCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LigneCommandeRepository extends JpaRepository<LigneCommande, Long> {

    @Modifying
    @Query("UPDATE LigneCommande lc SET lc.produit = NULL WHERE lc.produit.id = :produitId")
    void nullifyProduitReference(@Param("produitId") Long produitId);

    /**
     * Find products frequently bought together with the given product.
     * Looks at all orders that contain produitId, then counts how often other products
     * appear in those same orders. Returns product IDs ordered by co-purchase frequency.
     */
    @Query("SELECT lc2.produit.id FROM LigneCommande lc1 " +
           "JOIN LigneCommande lc2 ON lc1.commande.id = lc2.commande.id " +
           "WHERE lc1.produit.id = :produitId " +
           "AND lc2.produit.id != :produitId " +
           "AND lc2.produit IS NOT NULL " +
           "GROUP BY lc2.produit.id " +
           "ORDER BY COUNT(lc2.produit.id) DESC")
    List<Long> findCoPurchasedProductIds(@Param("produitId") Long produitId);
}
