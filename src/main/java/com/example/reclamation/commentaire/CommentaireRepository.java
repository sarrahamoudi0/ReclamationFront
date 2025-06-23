package com.example.reclamation.commentaire;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentaireRepository extends MongoRepository<Commentaire, String> {
    List<Commentaire> findByReclamationIdReclamation(String idReclamation);

}
