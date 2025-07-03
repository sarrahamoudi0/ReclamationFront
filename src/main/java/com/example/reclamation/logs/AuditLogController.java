package com.example.reclamation.logs;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogRepository auditLogRepository;

    @GetMapping("getlogs/auth")
    public List<AuditLog> getAuthLogs() {
        return auditLogRepository.findAll().stream()
                .filter(log -> log.getAction().equalsIgnoreCase("Connexion")
                        || log.getAction().equalsIgnoreCase("Déconnexion")
                        || log.getAction().equalsIgnoreCase("Création utilisateur")
                        || log.getAction().equalsIgnoreCase("Ban/Déban utilisateur")
                        || log.getAction().equalsIgnoreCase("Changement de rôle"))
                .toList();
    }

    @GetMapping("getlogs/reclamations")
    public List<AuditLog> getReclamationLogs() {
        List<AuditLog> logs = auditLogRepository.findAll();
        logs.forEach(log -> System.out.println("Log action: " + log.getAction() + ", details: " + log.getDetails()));
        return logs.stream()
                .filter(log -> log.getAction().toLowerCase().contains("réclamation")
                        || log.getAction().toLowerCase().contains("statut")
                        || log.getAction().toLowerCase().contains("priorité")
                        || log.getAction().toLowerCase().contains("catégorie")
                        || log.getAction().toLowerCase().contains("commentaire"))
                .toList();
    }


}
