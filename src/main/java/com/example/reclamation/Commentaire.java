package com.example.reclamation;

import lombok.*;
import org.springframework.data.annotation.Id;
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
    private LocalDateTime createdDate = LocalDateTime.now();
}
