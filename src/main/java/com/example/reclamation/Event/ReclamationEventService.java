package com.example.reclamation.Event;

import com.example.reclamation.Reclamation;
import com.example.reclamation.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor

public class ReclamationEventService {

    private final ReclamationEventRepository eventRepo;

    /** Enregistre un événement dans la timeline d’une réclamation. */
    public void logEvent(User acteur,
                         Reclamation reclamation,
                         EventType type,
                         String description) {

        ReclamationEvent event = ReclamationEvent.builder()
                .acteur(acteur)
                .reclamation(reclamation)
                .type(type)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();

        eventRepo.save(event);
    }

    /** Retourne la chronologie d’une réclamation triée par date croissante. */
    public List<ReclamationEvent> getEventsForReclamation(Reclamation reclamation) {
        return eventRepo.findByReclamationOrderByTimestampAsc(reclamation);
    }
}
