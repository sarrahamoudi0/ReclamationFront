package com.example.reclamation;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class NomSousCategorieDTO {
    private String nomSousCategorie;

    // Getter
    public String getNom() {
        return nomSousCategorie;
    }

    // Setter
    public void setNom(String nom) {
        this.nomSousCategorie = nom;
    }

}
