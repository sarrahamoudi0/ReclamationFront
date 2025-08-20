package com.example.reclamation.reunion.dto;

import com.example.reclamation.reunion.ReunionStatut;
import com.example.reclamation.reunion.ReunionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReunionRequest {
    
    private String titre;
    private String description;
    private String lieu;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private ReunionStatut statut;
    private ReunionType type;
    private List<String> participantIds;
    private String ordreDuJour;
    private String notes;
} 