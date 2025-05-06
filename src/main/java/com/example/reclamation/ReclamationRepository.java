package com.example.reclamation;

import com.example.reclamation.user.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReclamationRepository extends MongoRepository<Reclamation, String> {
    List<Reclamation> findByUser(User user);

    // Or if you prefer querying by userId (assuming you still want to use the userId)
    List<Reclamation> findByUserId(long userId);
}
