package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Long> {

    Optional<Categorie> findByNom(String nom);

    boolean existsByNom(String nom);

    @Query("SELECT DISTINCT c FROM Categorie c LEFT JOIN FETCH c.produits ORDER BY c.dateCreation DESC")
    List<Categorie> findAllWithProduits();
}
