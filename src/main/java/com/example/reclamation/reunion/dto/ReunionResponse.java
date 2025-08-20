package com.example.reclamation.reunion.dto;

import com.example.reclamation.reunion.Reunion;
import com.example.reclamation.reunion.ReunionStatut;
import com.example.reclamation.reunion.ReunionType;
import com.example.reclamation.user.User;
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
public class ReunionResponse {
    
    private String id;
    private String titre;
    private String description;
    private String lieu;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private ReunionStatut statut;
    private ReunionType type;
    private UserInfo organisateur;
    private List<UserInfo> participants;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
    private String ordreDuJour;
    private String notes;
    private boolean rappelEnvoye;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String firstname;
        private String lastname;
        private String email;
        private String role;
        
        public static UserInfo fromUser(User user) {
            return UserInfo.builder()
                    .id(user.getId())
                    .firstname(user.getFirstname())
                    .lastname(user.getLastname())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();
        }
    }
    
    public static ReunionResponse fromReunion(Reunion reunion) {
        return ReunionResponse.builder()
                .id(reunion.getId())
                .titre(reunion.getTitre())
                .description(reunion.getDescription())
                .lieu(reunion.getLieu())
                .dateDebut(reunion.getDateDebut())
                .dateFin(reunion.getDateFin())
                .statut(reunion.getStatut())
                .type(reunion.getType())
                .organisateur(UserInfo.fromUser(reunion.getOrganisateur()))
                .participants(reunion.getParticipants().stream()
                        .map(UserInfo::fromUser)
                        .toList())
                .createdDate(reunion.getCreatedDate())
                .lastModifiedDate(reunion.getLastModifiedDate())
                .ordreDuJour(reunion.getOrdreDuJour())
                .notes(reunion.getNotes())
                .rappelEnvoye(reunion.isRappelEnvoye())
                .build();
    }
} 