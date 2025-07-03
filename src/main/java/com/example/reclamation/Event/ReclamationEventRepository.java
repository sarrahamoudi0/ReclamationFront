package com.example.reclamation.Event;

import com.example.reclamation.reclamation.Reclamation;
import com.example.reclamation.role.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;


public interface ReclamationEventRepository  extends MongoRepository<ReclamationEvent, String> {

    List<ReclamationEvent> findByReclamationOrderByTimestampAsc(Reclamation reclamation);
    @Query("{ 'acteur.role': { $in: [?0, ?1] } }")
    List<ReclamationEvent> findByActeurRoleIn(List<Role> roles);

}