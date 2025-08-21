package com.example.reclamation.presence.dto;

import com.example.reclamation.presence.PresenceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresenceResponse {
    private String id;
    private String userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private LocalDate date;
    private PresenceStatus status;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private LocalTime expectedCheckInTime;
    private Integer lateMinutes;
    private String notes;
    private String markedByFirstName;
    private String markedByLastName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isManualEntry;
}
