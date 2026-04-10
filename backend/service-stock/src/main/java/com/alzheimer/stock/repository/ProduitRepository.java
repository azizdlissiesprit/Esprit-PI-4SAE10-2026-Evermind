package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByCategorieId(Long categorieId);

    boolean existsByNomAndCategorieId(String nom, Long categorieId);

    long countByQuantiteLessThanEqual(int quantite);

    long countByQuantite(int quantite);

    @Query("SELECT COALESCE(SUM(p.prix * p.quantite), 0) FROM Produit p")
    BigDecimal calculerValeurTotaleStock();

    /** Products expiring before a given date (ordered by expiration date ascending) */
    @Query("SELECT p FROM Produit p WHERE p.dateExpiration IS NOT NULL AND p.dateExpiration <= :date ORDER BY p.dateExpiration ASC")
    List<Produit> findExpiringBefore(@Param("date") LocalDate date);

    /** Count products already expired */
    @Query("SELECT COUNT(p) FROM Produit p WHERE p.dateExpiration IS NOT NULL AND p.dateExpiration < :today")
    long countExpired(@Param("today") LocalDate today);

    /** Count products expiring within N days from today */
    @Query("SELECT COUNT(p) FROM Produit p WHERE p.dateExpiration IS NOT NULL AND p.dateExpiration >= :today AND p.dateExpiration <= :limit")
    long countExpiringSoon(@Param("today") LocalDate today, @Param("limit") LocalDate limit);
}
