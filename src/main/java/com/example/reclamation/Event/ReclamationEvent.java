package com.example.reclamation.Event;

import com.example.reclamation.Reclamation;
import com.example.reclamation.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "reclamation_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReclamationEvent {
    @Id
    private String id;

    private EventType type;       // Type d’événement (enum ci‑dessus)

    private String description;   // Détail lisible (généré automatiquement)

    private LocalDateTime timestamp;

    @DBRef
    private User acteur;

    @DBRef
    private Reclamation reclamation;
}
