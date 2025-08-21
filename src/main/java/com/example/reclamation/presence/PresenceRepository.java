package com.example.reclamation.presence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PresenceRepository extends MongoRepository<Presence, String> {
    
    // Find presence by user and date
    Optional<Presence> findByUserIdAndDate(String userId, LocalDate date);
    
    // Find all presences for a user in a date range
    List<Presence> findByUserIdAndDateBetweenOrderByDateDesc(String userId, LocalDate startDate, LocalDate endDate);
    
    // Find all presences for a specific date
    List<Presence> findByDate(LocalDate date);
    
    // Find all presences for a user
    Page<Presence> findByUserIdOrderByDateDesc(String userId, Pageable pageable);
    
    // Find presences by status for a specific date
    List<Presence> findByDateAndStatus(LocalDate date, PresenceStatus status);
    
    // Find presences by status for a user in a date range
    List<Presence> findByUserIdAndDateBetweenAndStatus(String userId, LocalDate startDate, LocalDate endDate, PresenceStatus status);
    
    // Count presences by status for a user in a date range
    long countByUserIdAndDateBetweenAndStatus(String userId, LocalDate startDate, LocalDate endDate, PresenceStatus status);
    
    // Check if user already has presence for a date
    boolean existsByUserIdAndDate(String userId, LocalDate date);
    
    // Find all presences for a date range
    List<Presence> findByDateBetweenOrderByDateDesc(LocalDate startDate, LocalDate endDate);
}
