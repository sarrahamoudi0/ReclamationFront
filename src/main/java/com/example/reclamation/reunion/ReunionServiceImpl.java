package com.example.reclamation.reunion;

import com.example.reclamation.reunion.dto.CreateReunionRequest;
import com.example.reclamation.reunion.dto.ReunionResponse;
import com.example.reclamation.reunion.dto.UpdateReunionRequest;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReunionServiceImpl implements IReunionService {
    
    private final ReunionRepository reunionRepository;
    private final UserRepository userRepository;
    
    @Override
    public ReunionResponse createReunion(CreateReunionRequest request, String adminId) {
        // Validate admin user
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin utilisateur non trouvé"));
        
        // Validate participants
        List<User> participants = userRepository.findAllById(request.getParticipantIds());
        if (participants.size() != request.getParticipantIds().size()) {
            throw new RuntimeException("Certains participants n'ont pas été trouvés");
        }
        
        // Validate dates
        if (request.getDateDebut().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("La date de début ne peut pas être dans le passé");
        }
        if (request.getDateFin().isBefore(request.getDateDebut())) {
            throw new RuntimeException("La date de fin doit être après la date de début");
        }
        
        // Create reunion
        Reunion reunion = Reunion.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .lieu(request.getLieu())
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .type(request.getType())
                .organisateur(admin)
                .participants(participants)
                .ordreDuJour(request.getOrdreDuJour())
                .notes(request.getNotes())
                .build();
        
        Reunion savedReunion = reunionRepository.save(reunion);
        log.info("Réunion créée avec succès: {}", savedReunion.getId());
        
        return ReunionResponse.fromReunion(savedReunion);
    }
    
    @Override
    public ReunionResponse updateReunion(String reunionId, UpdateReunionRequest request, String adminId) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new RuntimeException("Réunion non trouvée"));
        
        // Check if user is the organizer
        if (!reunion.getOrganisateur().getId().equals(adminId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette réunion");
        }
        
        // Update fields if provided
        if (request.getTitre() != null) reunion.setTitre(request.getTitre());
        if (request.getDescription() != null) reunion.setDescription(request.getDescription());
        if (request.getLieu() != null) reunion.setLieu(request.getLieu());
        if (request.getDateDebut() != null) reunion.setDateDebut(request.getDateDebut());
        if (request.getDateFin() != null) reunion.setDateFin(request.getDateFin());
        if (request.getStatut() != null) reunion.setStatut(request.getStatut());
        if (request.getType() != null) reunion.setType(request.getType());
        if (request.getOrdreDuJour() != null) reunion.setOrdreDuJour(request.getOrdreDuJour());
        if (request.getNotes() != null) reunion.setNotes(request.getNotes());
        
        // Update participants if provided
        if (request.getParticipantIds() != null && !request.getParticipantIds().isEmpty()) {
            List<User> participants = userRepository.findAllById(request.getParticipantIds());
            reunion.setParticipants(participants);
        }
        
        reunion.setLastModifiedDate(LocalDateTime.now());
        
        Reunion updatedReunion = reunionRepository.save(reunion);
        log.info("Réunion mise à jour avec succès: {}", updatedReunion.getId());
        
        return ReunionResponse.fromReunion(updatedReunion);
    }
    
    @Override
    public ReunionResponse getReunionById(String reunionId) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new RuntimeException("Réunion non trouvée"));
        return ReunionResponse.fromReunion(reunion);
    }
    
    @Override
    public Page<ReunionResponse> getAllReunions(Pageable pageable) {
        Page<Reunion> reunions = reunionRepository.findAll(pageable);
        return reunions.map(ReunionResponse::fromReunion);
    }
    
    @Override
    public List<ReunionResponse> getReunionsByOrganizer(String adminId) {
        List<Reunion> reunions = reunionRepository.findByOrganisateurIdOrderByDateDebutDesc(adminId);
        return reunions.stream()
                .map(ReunionResponse::fromReunion)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ReunionResponse> getReunionsByParticipant(String userId) {
        List<Reunion> reunions = reunionRepository.findByParticipantsIdOrderByDateDebutDesc(userId);
        return reunions.stream()
                .map(ReunionResponse::fromReunion)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ReunionResponse> getUpcomingReunions() {
        List<Reunion> reunions = reunionRepository.findUpcomingReunions(LocalDateTime.now());
        return reunions.stream()
                .map(ReunionResponse::fromReunion)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ReunionResponse> getReunionsByStatus(ReunionStatut statut) {
        List<Reunion> reunions = reunionRepository.findByStatutOrderByDateDebutDesc(statut);
        return reunions.stream()
                .map(ReunionResponse::fromReunion)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ReunionResponse> getReunionsByType(ReunionType type) {
        List<Reunion> reunions = reunionRepository.findByTypeOrderByDateDebutDesc(type);
        return reunions.stream()
                .map(ReunionResponse::fromReunion)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ReunionResponse> getReunionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<Reunion> reunions = reunionRepository.findByDateRange(startDate, endDate);
        return reunions.stream()
                .map(ReunionResponse::fromReunion)
                .collect(Collectors.toList());
    }
    
    @Override
    public ReunionResponse changeReunionStatus(String reunionId, ReunionStatut newStatus, String adminId) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new RuntimeException("Réunion non trouvée"));
        
        // Check if user is the organizer
        if (!reunion.getOrganisateur().getId().equals(adminId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette réunion");
        }
        
        reunion.setStatut(newStatus);
        reunion.setLastModifiedDate(LocalDateTime.now());
        
        Reunion updatedReunion = reunionRepository.save(reunion);
        log.info("Statut de la réunion changé à: {} pour la réunion: {}", newStatus, reunionId);
        
        return ReunionResponse.fromReunion(updatedReunion);
    }
    
    @Override
    public ReunionResponse cancelReunion(String reunionId, String adminId) {
        return changeReunionStatus(reunionId, ReunionStatut.ANNULEE, adminId);
    }
    
    @Override
    public void deleteReunion(String reunionId, String adminId) {
        Reunion reunion = reunionRepository.findById(reunionId)
                .orElseThrow(() -> new RuntimeException("Réunion non trouvée"));
        
        // Check if user is the organizer
        if (!reunion.getOrganisateur().getId().equals(adminId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette réunion");
        }
        
        reunionRepository.delete(reunion);
        log.info("Réunion supprimée avec succès: {}", reunionId);
    }
    
    @Override
    public void sendReunionReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        
        List<Reunion> reunionsNeedingReminders = reunionRepository
                .findReunionsNeedingReminders(now, tomorrow);
        
        for (Reunion reunion : reunionsNeedingReminders) {
            // TODO: Implement email/notification sending logic
            log.info("Envoi de rappel pour la réunion: {} - {}", reunion.getTitre(), reunion.getDateDebut());
            
            // Mark reminder as sent
            reunion.setRappelEnvoye(true);
            reunionRepository.save(reunion);
        }
    }
} 