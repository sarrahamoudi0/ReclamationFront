package com.example.reclamation.reunion;

import com.example.reclamation.reunion.dto.CreateReunionRequest;
import com.example.reclamation.reunion.dto.ReunionResponse;
import com.example.reclamation.reunion.dto.UpdateReunionRequest;
import com.example.reclamation.role.Role;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reunions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin("*")
public class ReunionController {
    
    private final IReunionService reunionService;
    private final UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<ReunionResponse> createReunion(@Valid @RequestBody CreateReunionRequest request) {
        try {
            String adminId = getCurrentUserId();
            ReunionResponse reunion = reunionService.createReunion(request, adminId);
            return ResponseEntity.status(HttpStatus.CREATED).body(reunion);
        } catch (Exception e) {
            log.error("Erreur lors de la création de la réunion: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{reunionId}")
    public ResponseEntity<ReunionResponse> updateReunion(
            @PathVariable String reunionId,
            @Valid @RequestBody UpdateReunionRequest request) {
        try {
            String adminId = getCurrentUserId();
            ReunionResponse reunion = reunionService.updateReunion(reunionId, request, adminId);
            return ResponseEntity.ok(reunion);
        } catch (Exception e) {
            log.error("Erreur lors de la mise à jour de la réunion: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{reunionId}")
    public ResponseEntity<ReunionResponse> getReunionById(@PathVariable String reunionId) {
        try {
            ReunionResponse reunion = reunionService.getReunionById(reunionId);
            return ResponseEntity.ok(reunion);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de la réunion: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping
    public ResponseEntity<Page<ReunionResponse>> getAllReunions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ReunionResponse> reunions = reunionService.getAllReunions(pageable);
            return ResponseEntity.ok(reunions);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des réunions: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/organisateur")
    public ResponseEntity<List<ReunionResponse>> getReunionsByOrganizer() {
        try {
            String adminId = getCurrentUserId();
            List<ReunionResponse> reunions = reunionService.getReunionsByOrganizer(adminId);
            return ResponseEntity.ok(reunions);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des réunions de l'organisateur: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/participant")
    public ResponseEntity<List<ReunionResponse>> getReunionsByParticipant() {
        try {
            String userId = getCurrentUserId();
            List<ReunionResponse> reunions = reunionService.getReunionsByParticipant(userId);
            return ResponseEntity.ok(reunions);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des réunions du participant: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<ReunionResponse>> getUpcomingReunions() {
        try {
            List<ReunionResponse> reunions = reunionService.getUpcomingReunions();
            return ResponseEntity.ok(reunions);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des réunions à venir: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/status/{statut}")
    public ResponseEntity<List<ReunionResponse>> getReunionsByStatus(@PathVariable ReunionStatut statut) {
        try {
            List<ReunionResponse> reunions = reunionService.getReunionsByStatus(statut);
            return ResponseEntity.ok(reunions);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des réunions par statut: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ReunionResponse>> getReunionsByType(@PathVariable ReunionType type) {
        try {
            List<ReunionResponse> reunions = reunionService.getReunionsByType(type);
            return ResponseEntity.ok(reunions);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des réunions par type: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<ReunionResponse>> getReunionsByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        try {
            List<ReunionResponse> reunions = reunionService.getReunionsByDateRange(startDate, endDate);
            return ResponseEntity.ok(reunions);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des réunions par plage de dates: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PatchMapping("/{reunionId}/status")
    public ResponseEntity<ReunionResponse> changeReunionStatus(
            @PathVariable String reunionId,
            @RequestParam ReunionStatut newStatus) {
        try {
            String adminId = getCurrentUserId();
            ReunionResponse reunion = reunionService.changeReunionStatus(reunionId, newStatus, adminId);
            return ResponseEntity.ok(reunion);
        } catch (Exception e) {
            log.error("Erreur lors du changement de statut de la réunion: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{reunionId}/cancel")
    public ResponseEntity<ReunionResponse> cancelReunion(@PathVariable String reunionId) {
        try {
            String adminId = getCurrentUserId();
            ReunionResponse reunion = reunionService.cancelReunion(reunionId, adminId);
            return ResponseEntity.ok(reunion);
        } catch (Exception e) {
            log.error("Erreur lors de l'annulation de la réunion: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{reunionId}")
    public ResponseEntity<Void> deleteReunion(@PathVariable String reunionId) {
        try {
            String adminId = getCurrentUserId();
            reunionService.deleteReunion(reunionId, adminId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Erreur lors de la suppression de la réunion: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/agents")
    public ResponseEntity<List<User>> getAvailableAgents() {
        try {
            List<User> agents = userRepository.findByRole(Role.ROLE_AGENT);
            return ResponseEntity.ok(agents);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des agents: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/reminders/send")
    public ResponseEntity<Void> sendReunionReminders() {
        try {
            reunionService.sendReunionReminders();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi des rappels: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return user.getId();
    }
} 