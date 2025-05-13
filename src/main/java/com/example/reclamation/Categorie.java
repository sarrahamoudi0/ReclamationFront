package com.example.reclamation;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Setter
@Data
@Document(collection = "categorie")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Categorie {
    @Id
    private String idCategorie;
    private String nomCategorie;
    @DBRef
    private List<Categorie> sousCategories;
}
