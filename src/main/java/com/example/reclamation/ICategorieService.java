package com.example.reclamation;

import java.util.List;

public interface ICategorieService {
    Categorie createCategorie(Categorie categorie);
    List<Categorie> getAllCategories();

    Categorie updateCategorie(Categorie categorie);
    void deleteCategorie(String id);
    Categorie getCategorieById(String id);
}
