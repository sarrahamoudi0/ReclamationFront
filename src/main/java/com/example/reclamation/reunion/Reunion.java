package com.example.reclamation.reunion;

import com.example.reclamation.user.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Data
@Document(collection = "reunions")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reunion {
    @Id
    private String id;

    private String titre;
    private String description;
    private String lieu;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private ReunionStatut statut = ReunionStatut.PLANIFIEE;
    private ReunionType type = ReunionType.REUNION_TRAVAIL;
    
    @DBRef
    private User organisateur; // Admin who creates the meeting
    
    @DBRef
    private List<User> participants; // Agents and other participants
    
    private LocalDateTime createdDate = LocalDateTime.now();
    private LocalDateTime lastModifiedDate = LocalDateTime.now();
    
    // Optional fields
    private String ordreDuJour;
    private String notes;
    private boolean rappelEnvoye = false;
} 