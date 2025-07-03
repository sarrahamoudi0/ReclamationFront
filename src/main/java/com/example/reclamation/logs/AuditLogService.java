package com.example.reclamation.logs;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor

public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(String agentEmail, String action, String details) {
        try {
            AuditLog log = AuditLog.builder()
                    .agentEmail(agentEmail)
                    .action(action)
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();

            AuditLog savedLog = auditLogRepository.save(log);
            System.out.println("Audit log saved with ID: " + savedLog.getId());
        } catch (Exception e) {
            System.err.println("Error saving audit log: " + e.getMessage());
            e.printStackTrace();
        }
    }

}
