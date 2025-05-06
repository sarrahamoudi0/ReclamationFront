package com.example.reclamation;

import com.example.reclamation.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;


@Getter
@Setter
@Data
@Document(collection = "Reclamation")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reclamation {
    @Id
    private String idReclamation;

    private String titre;
    private String description;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Statut statut= Statut.valueOf("Nouveau");
    private Priorite priorite= Priorite.valueOf("Faible");
    @Lob
    @Column(length = 209715200)
    private byte[] image_reclamation;

    @DBRef
    private List<Commentaire> commentaires;

    @DBRef
    private Categorie categorie;
    @DBRef
    private User user;

}

