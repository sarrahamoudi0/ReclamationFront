package com.example.reclamation.presence;

import com.example.reclamation.presence.dto.PresenceRequest;
import com.example.reclamation.presence.dto.PresenceResponse;
import com.example.reclamation.presence.dto.PresenceStatisticsResponse;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PresenceService {
    
    private final PresenceRepository presenceRepository;
    private final UserRepository userRepository;
    
    // Mark presence for a user
    public PresenceResponse markPresence(PresenceRequest request, User adminUser) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if presence already exists for this date
        Optional<Presence> existingPresence = presenceRepository.findByUserIdAndDate(request.getUserId(), request.getDate());
        if (existingPresence.isPresent()) {
            throw new RuntimeException("Presence already marked for this date");
        }
        
        Presence presence = new Presence(request.getUserId(), request.getDate(), request.getStatus(), adminUser.getId());
        presence.setCheckInTime(request.getCheckInTime());
        presence.setCheckOutTime(request.getCheckOutTime());
        presence.setNotes(request.getNotes());
        
        // Calculate late minutes if check-in time is provided
        if (request.getCheckInTime() != null && request.getCheckInTime().isAfter(presence.getExpectedCheckInTime())) {
            presence.setLateMinutes((int) java.time.Duration.between(presence.getExpectedCheckInTime(), request.getCheckInTime()).toMinutes());
        }
        
        Presence savedPresence = presenceRepository.save(presence);
        return mapToResponse(savedPresence);
    }
    
    // Update existing presence
    public PresenceResponse updatePresence(String presenceId, PresenceRequest request, User adminUser) {
        Presence presence = presenceRepository.findById(presenceId)
                .orElseThrow(() -> new RuntimeException("Presence not found"));
        
        presence.setStatus(request.getStatus());
        presence.setCheckInTime(request.getCheckInTime());
        presence.setCheckOutTime(request.getCheckOutTime());
        presence.setNotes(request.getNotes());
        presence.setMarkedById(adminUser.getId());
        
        // Recalculate late minutes
        if (request.getCheckInTime() != null && request.getCheckInTime().isAfter(presence.getExpectedCheckInTime())) {
            presence.setLateMinutes((int) java.time.Duration.between(presence.getExpectedCheckInTime(), request.getCheckInTime()).toMinutes());
        } else {
            presence.setLateMinutes(null);
        }
        
        Presence updatedPresence = presenceRepository.save(presence);
        return mapToResponse(updatedPresence);
    }
    
    // Get presence by ID
    public PresenceResponse getPresenceById(String presenceId) {
        Presence presence = presenceRepository.findById(presenceId)
                .orElseThrow(() -> new RuntimeException("Presence not found"));
        return mapToResponse(presence);
    }
    
    // Get all presences for a user
    public Page<PresenceResponse> getUserPresences(String userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return presenceRepository.findByUserIdOrderByDateDesc(userId, pageable)
                .map(this::mapToResponse);
    }
    
    // Get presences for a specific date
    public List<PresenceResponse> getPresencesByDate(LocalDate date) {
        return presenceRepository.findByDate(date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    // Get presences by status for a date
    public List<PresenceResponse> getPresencesByDateAndStatus(LocalDate date, PresenceStatus status) {
        return presenceRepository.findByDateAndStatus(date, status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    // Get agents without presence for a date
    public List<User> getAgentsWithoutPresence(LocalDate date) {
        List<Presence> presencesForDate = presenceRepository.findByDate(date);
        List<String> presentUserIds = presencesForDate.stream()
                .map(Presence::getUserId)
                .collect(Collectors.toList());
        
        return userRepository.findByRole(com.example.reclamation.role.Role.ROLE_AGENT)
                .stream()
                .filter(user -> !presentUserIds.contains(user.getId()))
                .collect(Collectors.toList());
    }
    
    // Mark multiple presences (bulk operation)
    public List<PresenceResponse> markMultiplePresences(List<PresenceRequest> requests, User adminUser) {
        return requests.stream()
                .map(request -> markPresence(request, adminUser))
                .collect(Collectors.toList());
    }
    
    // Get presence statistics for a user
    public PresenceStatisticsResponse getPresenceStatistics(String userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Presence> presences = presenceRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startDate, endDate);
        Map<PresenceStatus, Long> statusCounts = presences.stream()
                .collect(Collectors.groupingBy(Presence::getStatus, Collectors.counting()));
        
        long totalDays = presences.size();
        long presentDays = statusCounts.getOrDefault(PresenceStatus.PRESENT, 0L);
        long absentDays = statusCounts.getOrDefault(PresenceStatus.ABSENT, 0L);
        long lateDays = statusCounts.getOrDefault(PresenceStatus.LATE, 0L);
        long leaveDays = statusCounts.getOrDefault(PresenceStatus.LEAVE, 0L);
        
        double attendancePercentage = totalDays > 0 ? 
                ((double) (presentDays + lateDays) / totalDays) * 100 : 0.0;
        
        return new PresenceStatisticsResponse(
                userId,
                user.getFirstname(),
                user.getLastname(),
                statusCounts,
                totalDays,
                attendancePercentage,
                presentDays,
                absentDays,
                lateDays,
                leaveDays
        );
    }
    
    // Delete presence
    public void deletePresence(String presenceId) {
        if (!presenceRepository.existsById(presenceId)) {
            throw new RuntimeException("Presence not found");
        }
        presenceRepository.deleteById(presenceId);
    }
    
    // Helper method to map Presence entity to PresenceResponse
    private PresenceResponse mapToResponse(Presence presence) {
        User user = userRepository.findById(presence.getUserId()).orElse(null);
        User markedBy = presence.getMarkedById() != null ? 
                userRepository.findById(presence.getMarkedById()).orElse(null) : null;
        
        return new PresenceResponse(
                presence.getId(),
                presence.getUserId(),
                user != null ? user.getFirstname() : null,
                user != null ? user.getLastname() : null,
                user != null ? user.getEmail() : null,
                presence.getDate(),
                presence.getStatus(),
                presence.getCheckInTime(),
                presence.getCheckOutTime(),
                presence.getExpectedCheckInTime(),
                presence.getLateMinutes(),
                presence.getNotes(),
                markedBy != null ? markedBy.getFirstname() : null,
                markedBy != null ? markedBy.getLastname() : null,
                presence.getCreatedAt(),
                presence.getUpdatedAt(),
                presence.getIsManualEntry()
        );
    }
}
