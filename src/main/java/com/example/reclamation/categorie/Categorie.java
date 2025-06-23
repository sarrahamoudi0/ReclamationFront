package com.example.reclamation.categorie;

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

    @DBRef(lazy = false)
    private List<SousCategorie> sousCategories; // List of references to SousCategorie documents
    // Getter
    public String getNom() {
        return nomCategorie;
    }

    // Setter
    public void setNom(String nom) {
        this.nomCategorie = nom;
    }
}
