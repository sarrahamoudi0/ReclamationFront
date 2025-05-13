package com.example.reclamation;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CategorieRepository extends MongoRepository<Categorie, String> {
    List<Categorie> findByIdCategorie(String parentId);


}
