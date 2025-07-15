package com.example.reclamation.notification;

import com.example.reclamation.user.User;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "notifications")

public class Notification {
    @Id
    private String id;
    private String message;
    private LocalDateTime date = LocalDateTime.now();
    private boolean vue = false;
    private NotificationStatus status;

    @DBRef
    private User destinataire;
    @DBRef
    private User actionPar;




    private String reclamationId;
}
