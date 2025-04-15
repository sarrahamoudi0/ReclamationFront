package com.example.reclamation;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReclamationRepository extends MongoRepository<Reclamation, String> {
}
