package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.ProduitDTO;
import com.alzheimer.stock.entite.Categorie;
import com.alzheimer.stock.entite.Produit;
import com.alzheimer.stock.exception.ResourceIntrouvableException;
import com.alzheimer.stock.repository.CategorieRepository;
import com.alzheimer.stock.repository.LigneCommandeRepository;
import com.alzheimer.stock.repository.LignePanierRepository;
import com.alzheimer.stock.repository.ProduitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProduitServiceImplTest {

    @Mock
    private ProduitRepository produitRepository;

    @Mock
    private CategorieRepository categorieRepository;

    @Mock
    private LignePanierRepository lignePanierRepository;

    @Mock
    private LigneCommandeRepository ligneCommandeRepository;

    @Mock
    private FichierStorageService fichierStorageService;

    @InjectMocks
    private ProduitServiceImpl produitService;

    private Produit produit;
    private ProduitDTO produitDTO;
    private Categorie categorie;

    @BeforeEach
    void setUp() {
        categorie = Categorie.builder().id(1L).nom("Mobilité").build();

        produit = Produit.builder()
                .id(1L)
                .nom("Fauteuil")
                .prix(new BigDecimal("100.0"))
                .categorie(categorie)
                .enPromo(false)
                .quantite(10)
                .build();

        produitDTO = ProduitDTO.builder()
                .nom("Fauteuil")
                .prix(new BigDecimal("100.0"))
                .categorieId(1L)
                .quantite(10)
                .build();
    }

    @Test
    void listerTousLesProduits_DoitRetournerListe() {
        when(produitRepository.findAll()).thenReturn(List.of(produit));

        List<ProduitDTO> result = produitService.listerTousLesProduits();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(produit.getNom(), result.get(0).getNom());
        verify(produitRepository, times(1)).findAll();
    }

    @Test
    void obtenirProduitParId_DoitRetournerProduit() {
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));

        ProduitDTO result = produitService.obtenirProduitParId(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(produitRepository, times(1)).findById(1L);
    }

    @Test
    void creerProduit_DoitRetournerProduitCree() {
        when(categorieRepository.findById(1L)).thenReturn(Optional.of(categorie));
        when(produitRepository.save(any(Produit.class))).thenReturn(produit);

        ProduitDTO result = produitService.creerProduit(produitDTO);

        assertNotNull(result);
        assertEquals("Fauteuil", result.getNom());
        verify(categorieRepository, times(1)).findById(1L);
        verify(produitRepository, times(1)).save(any(Produit.class));
    }

    @Test
    void supprimerProduit_DoitSupprimerProduit() {
        produit.setImageUrl("http://localhost/uploads/test.jpg");
        when(produitRepository.findById(1L)).thenReturn(Optional.of(produit));
        doNothing().when(fichierStorageService).supprimer("test.jpg");
        doNothing().when(ligneCommandeRepository).nullifyProduitReference(1L);
        doNothing().when(lignePanierRepository).deleteByProduitId(1L);
        doNothing().when(produitRepository).delete(produit);

        produitService.supprimerProduit(1L);

        verify(produitRepository, times(1)).findById(1L);
        verify(fichierStorageService, times(1)).supprimer("test.jpg");
        verify(ligneCommandeRepository, times(1)).nullifyProduitReference(1L);
        verify(lignePanierRepository, times(1)).deleteByProduitId(1L);
        verify(produitRepository, times(1)).delete(produit);
    }
}
