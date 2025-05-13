package com.example.reclamation;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Data
@Document(collection = "souscategorie")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SousCategorie {
    @Id
    private String idSousCategorie;
        private String nomSousCategorie;
    private String categorieParentId; // Reference to the parent category ID

    // This method returns the parent category ID
    public String getIdCategorie() {
        return categorieParentId;
    }
}
