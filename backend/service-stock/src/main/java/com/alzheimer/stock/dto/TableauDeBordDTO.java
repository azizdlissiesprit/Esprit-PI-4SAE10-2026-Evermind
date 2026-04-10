package com.alzheimer.stock.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableauDeBordDTO {

    private long totalCategories;
    private long totalProduits;
    private long produitsStockBas;
    private long produitsEnRupture;
    private BigDecimal valeurTotaleStock;
    private List<CategorieDTO> dernieresCategories;
    private List<ProduitDTO> derniersProduits;
    private long totalCommandes;
    private long commandesEnAttente;
    private BigDecimal chiffreAffaires;
    private List<CommandeDTO> dernieresCommandes;

    // Smart Alerts
    private long produitsExpires;
    private long produitsExpirantBientot;
    private List<ProduitDTO> alertesExpiration;
    private List<ProduitDTO> alertesReapprovisionnement;
}
