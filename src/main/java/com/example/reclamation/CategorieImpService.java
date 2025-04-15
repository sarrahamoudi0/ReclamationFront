package com.example.reclamation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class CategorieImpService implements ICategorieService  {

    @Autowired
    private CategorieRepository categorieRepository;
    @Override
    public Categorie createCategorie(Categorie categorie) {
        return categorieRepository.save(categorie);
    }
    @Override
    public List<Categorie> getAllCategories() {

    return categorieRepository.findAll();
    }
    @Override
    public Categorie updateCategorie(Categorie categorie){
        return categorieRepository.save(categorie);
    }
    @Override
    public void deleteCategorie(String id) {

        categorieRepository.deleteById(id);
    }
    @Override
    public Categorie getCategorieById(String id) {

        return categorieRepository.findById(id).orElse(null);
    }





}
