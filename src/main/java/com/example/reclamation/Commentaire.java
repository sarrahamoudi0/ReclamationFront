package com.example.reclamation;

import com.example.reclamation.user.User;
import jakarta.persistence.ManyToOne;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Data
@Document(collection = "commentaire")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Commentaire {
    @Id
    private String idCommentaire;
    private String contenu;
    private LocalDateTime dateCommentaire = LocalDateTime.now();
    private boolean interne = false;

    @DBRef
    private User user;

    @DBRef
    private Reclamation reclamation;
}
