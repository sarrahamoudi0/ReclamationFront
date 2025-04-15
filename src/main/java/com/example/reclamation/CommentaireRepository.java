package com.example.reclamation;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommentaireRepository extends MongoRepository<Commentaire, String> {
}
