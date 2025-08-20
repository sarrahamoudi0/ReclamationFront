package com.example.reclamation.reunion;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReunionRepository extends MongoRepository<Reunion, String> {
    
    // Find reunions by organizer
    List<Reunion> findByOrganisateurIdOrderByDateDebutDesc(String organisateurId);
    
    // Find reunions where user is a participant
    List<Reunion> findByParticipantsIdOrderByDateDebutDesc(String participantId);
    
    // Find reunions by status
    List<Reunion> findByStatutOrderByDateDebutDesc(ReunionStatut statut);
    
    // Find upcoming reunions
    @Query("{'dateDebut': {$gte: ?0}}")
    List<Reunion> findUpcomingReunions(LocalDateTime now);
    
    // Find reunions by date range
    @Query("{'dateDebut': {$gte: ?0, $lte: ?1}}")
    List<Reunion> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find reunions by type
    List<Reunion> findByTypeOrderByDateDebutDesc(ReunionType type);
    
    // Find reunions that need reminders (upcoming within 24 hours)
    @Query("{'dateDebut': {$gte: ?0, $lte: ?1}, 'rappelEnvoye': false}")
    List<Reunion> findReunionsNeedingReminders(LocalDateTime start, LocalDateTime end);
} 