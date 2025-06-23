package com.example.reclamation.categorie;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CategorieRepository extends MongoRepository<Categorie, String> {
    List<SousCategorie> findByIdCategorie(String parentId);


}
