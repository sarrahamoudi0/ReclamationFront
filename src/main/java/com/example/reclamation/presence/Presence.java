package com.example.reclamation.presence;

import com.example.reclamation.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "presences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Presence {
    
    @Id
    private String id;
    
    private String userId; // Reference to User ID
    private LocalDate date;
    private PresenceStatus status;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private LocalTime expectedCheckInTime = LocalTime.of(9, 0); // Default 9:00 AM
    private Integer lateMinutes;
    private String notes;
    private String markedById; // Reference to admin who marked the presence
    private Boolean isManualEntry = false; // True if manually entered by admin
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Constructor for manual entry
    public Presence(String userId, LocalDate date, PresenceStatus status, String markedById) {
        this.userId = userId;
        this.date = date;
        this.status = status;
        this.markedById = markedById;
        this.isManualEntry = true;
    }
    
    // Constructor for automatic check-in
    public Presence(String userId, LocalDate date, LocalTime checkInTime) {
        this.userId = userId;
        this.date = date;
        this.checkInTime = checkInTime;
        this.isManualEntry = false;
        
        // Determine status based on check-in time
        if (checkInTime.isAfter(this.expectedCheckInTime)) {
            this.status = PresenceStatus.LATE;
            this.lateMinutes = (int) java.time.Duration.between(this.expectedCheckInTime, checkInTime).toMinutes();
        } else {
            this.status = PresenceStatus.PRESENT;
        }
    }
}
