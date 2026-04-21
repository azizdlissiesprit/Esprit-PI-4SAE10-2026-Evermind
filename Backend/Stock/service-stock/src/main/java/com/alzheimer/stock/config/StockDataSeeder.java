package com.alzheimer.stock.config;

import com.alzheimer.stock.entite.Categorie;
import com.alzheimer.stock.entite.Produit;
import com.alzheimer.stock.repository.CategorieRepository;
import com.alzheimer.stock.repository.ProduitRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeds demo stock data on startup if the database is empty.
 * Populates categories and medical products appropriate for Alzheimer's care.
 */
@Component
@Slf4j
public class StockDataSeeder implements CommandLineRunner {

    private final CategorieRepository categorieRepository;
    private final ProduitRepository produitRepository;

    public StockDataSeeder(CategorieRepository categorieRepository, ProduitRepository produitRepository) {
        this.categorieRepository = categorieRepository;
        this.produitRepository = produitRepository;
    }

    @Override
    public void run(String... args) {
        if (categorieRepository.count() > 0 || produitRepository.count() > 0) {
            log.info("📊 Database already has stock data ({} categories, {} products). Skipping seeding.",
                    categorieRepository.count(), produitRepository.count());
            return;
        }

        log.info("🌱 ==========================================");
        log.info("🌱  SEEDING ALZHEIMER MEDICAL CARE STOCK DATA");
        log.info("🌱 ==========================================");

        try {
            // Categories
            Categorie catSecurite = Categorie.builder()
                    .nom("Équipements de Sécurité")
                    .description("Produits pour prévenir les chutes et les fugues, et assurer la sécurité du domicile.")
                    .build();

            Categorie catQuotidien = Categorie.builder()
                    .nom("Aides au Quotidien")
                    .description("Accessoires pour faciliter les repas, la toilette et l'habillement.")
                    .build();

            Categorie catStimulation = Categorie.builder()
                    .nom("Stimulation & Repère")
                    .description("Outils d'orientation temporelle et jeux de stimulation cognitive.")
                    .build();

            catSecurite = categorieRepository.save(catSecurite);
            catQuotidien = categorieRepository.save(catQuotidien);
            catStimulation = categorieRepository.save(catStimulation);

            log.info("🌱 Created 3 categories.");

            // Products
            seedProduct("Bracelets Anti-Fugue GPS", "Bracelet de géolocalisation étanche avec verrouillage sécurisé.",
                    new BigDecimal("150.00"), new BigDecimal("170.00"), 15, catSecurite, true, "LOT-SEC-001");
            seedProduct("Tapis Détecteur de Chute", "Tapis avec capteur de pression et alarme sans fil.",
                    new BigDecimal("85.50"), null, 8, catSecurite, false, "LOT-SEC-002");
            seedProduct("Barre d'Appui Ventousée", "Barre d'appui murale pour salle de bain sécurisée.",
                    new BigDecimal("35.00"), null, 25, catSecurite, false, "LOT-SEC-003");

            seedProduct("Set de Couverts Ergonomiques", "Couverts à manche épaissi pour une meilleure préhension.",
                    new BigDecimal("24.00"), null, 30, catQuotidien, false, "LOT-QUO-001");
            seedProduct("Assiette à Bord Incurvé", "Assiette avec rebord haut pour faciliter la prise des aliments.",
                    new BigDecimal("18.50"), null, 12, catQuotidien, false, "LOT-QUO-002");
            seedProduct("Gobelet Anti-Renversement", "Gobelet avec couvercle à bec et doubles anses.",
                    new BigDecimal("12.00"), new BigDecimal("15.00"), 50, catQuotidien, true, "LOT-QUO-003");

            seedProduct("Horloge Calendrier Digitale", "Horloge avec jour, date et moment de la journée (matin, soir).",
                    new BigDecimal("65.00"), null, 5, catStimulation, false, "LOT-STI-001");
            seedProduct("Puzzle Sensoriel 12 Pièces", "Puzzle thérapeutique avec grandes pièces adaptées.",
                    new BigDecimal("22.00"), null, 0, catStimulation, false, "LOT-STI-002"); // Rupture
            seedProduct("Livre de Réminiscence", "Livre d'images rétro pour stimuler la mémoire ancienne.",
                    new BigDecimal("30.00"), new BigDecimal("35.00"), 2, catStimulation, true, "LOT-STI-003"); // Stock faible

            log.info("🌱 Created 9 medical care products.");

            log.info("🌱 ==========================================");
            log.info("🌱  STOCK SEEDING COMPLETE");
            log.info("🌱 ==========================================");
            
        } catch (Exception e) {
            log.error("❌ Error while seeding stock data: {}", e.getMessage(), e);
        }
    }

    private void seedProduct(String nom, String description, BigDecimal prix, BigDecimal prixOriginal,
                             int quantite, Categorie categorie, boolean enPromo, String lot) {
        
        Produit p = Produit.builder()
                .nom(nom)
                .description(description)
                .prix(prix)
                .prixOriginal(prixOriginal)
                .quantite(quantite)
                .categorie(categorie)
                .enPromo(enPromo)
                .numeroLot(lot)
                .dateExpiration(LocalDate.now().plusMonths(24))
                .build();

        produitRepository.save(p);
    }
}
