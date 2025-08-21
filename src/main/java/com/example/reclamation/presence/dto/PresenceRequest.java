package com.example.reclamation.presence.dto;

import com.example.reclamation.presence.PresenceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresenceRequest {
    private String userId;
    private LocalDate date;
    private PresenceStatus status;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String notes;
}
