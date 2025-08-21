package com.example.reclamation.presence;

import com.example.reclamation.presence.dto.PresenceRequest;
import com.example.reclamation.presence.dto.PresenceResponse;
import com.example.reclamation.presence.dto.PresenceStatisticsResponse;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/presence")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PresenceController {
    
    private final PresenceService presenceService;
    private final UserService userService;
    
    // Mark presence for a user (Admin only)
    @PostMapping
    public ResponseEntity<PresenceResponse> markPresence(@RequestBody PresenceRequest request, Authentication authentication) {
        User adminUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        PresenceResponse response = presenceService.markPresence(request, adminUser);
        return ResponseEntity.ok(response);
    }
    
    // Update existing presence (Admin only)
    @PutMapping("/{presenceId}")
    public ResponseEntity<PresenceResponse> updatePresence(
            @PathVariable String presenceId,
            @RequestBody PresenceRequest request,
            Authentication authentication) {
        User adminUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        PresenceResponse response = presenceService.updatePresence(presenceId, request, adminUser);
        return ResponseEntity.ok(response);
    }
    
    // Get presence by ID
    @GetMapping("/{presenceId}")
    public ResponseEntity<PresenceResponse> getPresenceById(@PathVariable String presenceId) {
        PresenceResponse response = presenceService.getPresenceById(presenceId);
        return ResponseEntity.ok(response);
    }
    
    // Get all presences for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PresenceResponse>> getUserPresences(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PresenceResponse> response = presenceService.getUserPresences(userId, pageable);
        return ResponseEntity.ok(response);
    }
    
    // Get presences for a specific date
    @GetMapping("/date/{date}")
    public ResponseEntity<List<PresenceResponse>> getPresencesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<PresenceResponse> response = presenceService.getPresencesByDate(date);
        return ResponseEntity.ok(response);
    }
    
    // Get presences by status for a date
    @GetMapping("/date/{date}/status/{status}")
    public ResponseEntity<List<PresenceResponse>> getPresencesByDateAndStatus(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable PresenceStatus status) {
        List<PresenceResponse> response = presenceService.getPresencesByDateAndStatus(date, status);
        return ResponseEntity.ok(response);
    }
    
    // Get agents without presence for a date (Admin only)
    @GetMapping("/missing/{date}")
    public ResponseEntity<List<User>> getAgentsWithoutPresence(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<User> response = presenceService.getAgentsWithoutPresence(date);
        return ResponseEntity.ok(response);
    }
    
    // Mark multiple presences (bulk operation - Admin only)
    @PostMapping("/bulk")
    public ResponseEntity<List<PresenceResponse>> markMultiplePresences(
            @RequestBody List<PresenceRequest> requests,
            Authentication authentication) {
        User adminUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<PresenceResponse> response = presenceService.markMultiplePresences(requests, adminUser);
        return ResponseEntity.ok(response);
    }
    
    // Get presence statistics for a user
    @GetMapping("/statistics/{userId}")
    public ResponseEntity<PresenceStatisticsResponse> getPresenceStatistics(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        PresenceStatisticsResponse response = presenceService.getPresenceStatistics(userId, startDate, endDate);
        return ResponseEntity.ok(response);
    }
    
    // Delete presence (Admin only)
    @DeleteMapping("/{presenceId}")
    public ResponseEntity<Void> deletePresence(@PathVariable String presenceId) {
        presenceService.deletePresence(presenceId);
        return ResponseEntity.noContent().build();
    }
    
    // Get current user's presences
    @GetMapping("/my-presences")
    public ResponseEntity<Page<PresenceResponse>> getMyPresences(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Pageable pageable = PageRequest.of(page, size);
        Page<PresenceResponse> response = presenceService.getUserPresences(currentUser.getId(), pageable);
        return ResponseEntity.ok(response);
    }
    
    // Get current user's presence statistics
    @GetMapping("/my-statistics")
    public ResponseEntity<PresenceStatisticsResponse> getMyPresenceStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        PresenceStatisticsResponse response = presenceService.getPresenceStatistics(currentUser.getId(), startDate, endDate);
        return ResponseEntity.ok(response);
    }
}
