package com.example.reclamation.Event;

import com.example.reclamation.Reclamation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReclamationEventRepository  extends MongoRepository<ReclamationEvent, String> {

    List<ReclamationEvent> findByReclamationOrderByTimestampAsc(Reclamation reclamation);
}