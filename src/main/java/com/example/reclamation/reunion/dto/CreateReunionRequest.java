package com.example.reclamation.reunion.dto;

import com.example.reclamation.reunion.ReunionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CreateReunionRequest {
    
    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 100, message = "Le titre doit contenir entre 3 et 100 caractères")
    private String titre;
    
    @NotBlank(message = "La description est obligatoire")
    @Size(min = 10, max = 500, message = "La description doit contenir entre 10 et 500 caractères")
    private String description;
    
    @NotBlank(message = "Le lieu est obligatoire")
    private String lieu;
    
    @NotNull(message = "La date de début est obligatoire")
    private LocalDateTime dateDebut;
    
    @NotNull(message = "La date de fin est obligatoire")
    private LocalDateTime dateFin;
    
    @NotNull(message = "Le type de réunion est obligatoire")
    private ReunionType type;
    
    @NotNull(message = "Au moins un participant est requis")
    @Size(min = 1, message = "Au moins un participant est requis")
    private List<String> participantIds; // List of user IDs
    
    private String ordreDuJour;
    private String notes;
} 