package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.CategorieDTO;
import com.alzheimer.stock.entite.Categorie;
import com.alzheimer.stock.entite.Produit;
import com.alzheimer.stock.exception.ResourceIntrouvableException;
import com.alzheimer.stock.repository.CategorieRepository;
import com.alzheimer.stock.repository.LigneCommandeRepository;
import com.alzheimer.stock.repository.LignePanierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategorieServiceImplTest {

    @Mock
    private CategorieRepository categorieRepository;

    @Mock
    private LignePanierRepository lignePanierRepository;

    @Mock
    private LigneCommandeRepository ligneCommandeRepository;

    @Mock
    private FichierStorageService fichierStorageService;

    @InjectMocks
    private CategorieServiceImpl categorieService;

    private Categorie categorie;
    private CategorieDTO categorieDTO;

    @BeforeEach
    void setUp() {
        categorie = Categorie.builder()
                .id(1L)
                .nom("Mobilité")
                .description("Equipements de mobilité")
                .dateCreation(LocalDateTime.now())
                .dateModification(LocalDateTime.now())
                .produits(new ArrayList<>())
                .build();

        categorieDTO = CategorieDTO.builder()
                .nom("Mobilité")
                .description("Equipements de mobilité")
                .build();
    }

    @Test
    void listerToutesLesCategories_DoitRetournerListe() {
        when(categorieRepository.findAllWithProduits()).thenReturn(List.of(categorie));

        List<CategorieDTO> result = categorieService.listerToutesLesCategories();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(categorie.getNom(), result.get(0).getNom());
        verify(categorieRepository, times(1)).findAllWithProduits();
    }

    @Test
    void obtenirCategorieParId_DoitRetournerCategorie() {
        when(categorieRepository.findById(1L)).thenReturn(Optional.of(categorie));

        CategorieDTO result = categorieService.obtenirCategorieParId(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Mobilité", result.getNom());
        verify(categorieRepository, times(1)).findById(1L);
    }

    @Test
    void obtenirCategorieParId_DoitLancerExceptionSiIntrouvable() {
        when(categorieRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ResourceIntrouvableException.class, () -> categorieService.obtenirCategorieParId(2L));
        verify(categorieRepository, times(1)).findById(2L);
    }

    @Test
    void creerCategorie_DoitRetournerCategorieCree() {
        when(categorieRepository.save(any(Categorie.class))).thenReturn(categorie);

        CategorieDTO result = categorieService.creerCategorie(categorieDTO);

        assertNotNull(result);
        assertEquals("Mobilité", result.getNom());
        verify(categorieRepository, times(1)).save(any(Categorie.class));
    }

    @Test
    void modifierCategorie_DoitModifierEtRetourner() {
        when(categorieRepository.findById(1L)).thenReturn(Optional.of(categorie));
        when(categorieRepository.save(any(Categorie.class))).thenReturn(categorie);

        categorieDTO.setNom("Updated");
        CategorieDTO result = categorieService.modifierCategorie(1L, categorieDTO);

        assertNotNull(result);
        assertEquals("Updated", categorie.getNom());
        verify(categorieRepository, times(1)).findById(1L);
        verify(categorieRepository, times(1)).save(any(Categorie.class));
    }

    @Test
    void supprimerCategorie_DoitSupprimerCategorieSansProduits() {
        when(categorieRepository.findById(1L)).thenReturn(Optional.of(categorie));
        doNothing().when(categorieRepository).delete(categorie);

        categorieService.supprimerCategorie(1L);

        verify(categorieRepository, times(1)).findById(1L);
        verify(categorieRepository, times(1)).delete(categorie);
        verifyNoInteractions(fichierStorageService, ligneCommandeRepository, lignePanierRepository);
    }

    @Test
    void supprimerCategorie_DoitSupprimerImagesEtReferences() {
        Produit p = new Produit();
        p.setId(10L);
        p.setImageUrl("http://localhost/uploads/image.jpg");
        categorie.getProduits().add(p);

        when(categorieRepository.findById(1L)).thenReturn(Optional.of(categorie));
        doNothing().when(categorieRepository).delete(categorie);
        doNothing().when(fichierStorageService).supprimer("image.jpg");
        doNothing().when(ligneCommandeRepository).nullifyProduitReference(10L);
        doNothing().when(lignePanierRepository).deleteByProduitId(10L);

        categorieService.supprimerCategorie(1L);

        verify(categorieRepository, times(1)).findById(1L);
        verify(categorieRepository, times(1)).delete(categorie);
        verify(fichierStorageService, times(1)).supprimer("image.jpg");
        verify(ligneCommandeRepository, times(1)).nullifyProduitReference(10L);
        verify(lignePanierRepository, times(1)).deleteByProduitId(10L);
    }
}
