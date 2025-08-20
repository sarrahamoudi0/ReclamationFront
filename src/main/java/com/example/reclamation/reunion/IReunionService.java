package com.example.reclamation.reunion;

import com.example.reclamation.reunion.dto.CreateReunionRequest;
import com.example.reclamation.reunion.dto.ReunionResponse;
import com.example.reclamation.reunion.dto.UpdateReunionRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface IReunionService {
    
    // Create a new reunion
    ReunionResponse createReunion(CreateReunionRequest request, String adminId);
    
    // Update an existing reunion
    ReunionResponse updateReunion(String reunionId, UpdateReunionRequest request, String adminId);
    
    // Get reunion by ID
    ReunionResponse getReunionById(String reunionId);
    
    // Get all reunions with pagination
    Page<ReunionResponse> getAllReunions(Pageable pageable);
    
    // Get reunions by organizer (admin)
    List<ReunionResponse> getReunionsByOrganizer(String adminId);
    
    // Get reunions where user is participant
    List<ReunionResponse> getReunionsByParticipant(String userId);
    
    // Get upcoming reunions
    List<ReunionResponse> getUpcomingReunions();
    
    // Get reunions by status
    List<ReunionResponse> getReunionsByStatus(ReunionStatut statut);
    
    // Get reunions by type
    List<ReunionResponse> getReunionsByType(ReunionType type);
    
    // Get reunions by date range
    List<ReunionResponse> getReunionsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    // Change reunion status
    ReunionResponse changeReunionStatus(String reunionId, ReunionStatut newStatus, String adminId);
    
    // Cancel reunion
    ReunionResponse cancelReunion(String reunionId, String adminId);
    
    // Delete reunion
    void deleteReunion(String reunionId, String adminId);
    
    // Send reminder for upcoming reunions
    void sendReunionReminders();
} 