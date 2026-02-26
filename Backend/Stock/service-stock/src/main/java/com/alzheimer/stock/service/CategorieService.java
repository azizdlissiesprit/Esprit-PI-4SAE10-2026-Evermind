package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.CategorieDTO;

import java.util.List;

public interface CategorieService {

    List<CategorieDTO> listerToutesLesCategories();

    CategorieDTO obtenirCategorieParId(Long id);

    CategorieDTO creerCategorie(CategorieDTO categorieDTO);

    CategorieDTO modifierCategorie(Long id, CategorieDTO categorieDTO);

    void supprimerCategorie(Long id);
}
