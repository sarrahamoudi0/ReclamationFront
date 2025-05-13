package com.example.reclamation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CategorieImpService implements ICategorieService {

    @Autowired
    private CategorieRepository categorieRepository;

    @Autowired
    private SousCategorieRepository sousCategorieRepository; // Repository for SousCategorie

    @Override
    public Categorie createCategorie(Categorie categorie) {
        // Save the parent category
        return categorieRepository.save(categorie);
    }

    @Override
    public List<Categorie> getAllCategories() {
        return categorieRepository.findAll();
    }

    @Override
    public Categorie updateCategorie(Categorie categorie) {
        // Update and save the category
        return categorieRepository.save(categorie);
    }

    @Override
    public void deleteCategorie(String id) {
        // Delete category by ID
        categorieRepository.deleteById(id);
    }

    @Override
    public Categorie getCategorieById(String id) {
        return categorieRepository.findById(id).orElse(null);
    }

    @Override
    public Categorie ajouterSousCategorie(String idCategorieParent, String nomSousCategorie) {
        return null;
    }

    @Override
    public Categorie supprimerSousCategorie(String idCategorieParent, String idSousCategorie) {
        return null;
    }

    @Override
    public Categorie addSubcategory(String idCategorieParent, String nomSousCategorie) {
        // Fetch the parent category
        Categorie parent = categorieRepository.findById(idCategorieParent)
                .orElseThrow(() -> new RuntimeException("Catégorie parente non trouvée"));

        // Create the new subcategory
        SousCategorie sousCategorie = new SousCategorie();
        sousCategorie.setNomSousCategorie(nomSousCategorie);
        sousCategorie.setCategorieParentId(idCategorieParent);

        // Save the new subcategory
        SousCategorie savedSub = sousCategorieRepository.save(sousCategorie);

        // Ensure the parent category has a list of subcategories
        if (parent.getSousCategories() == null) {
            parent.setSousCategories(new ArrayList<>());
        }

        // Add the new subcategory to the parent's list
        parent.getSousCategories().add(savedSub);

        // Save the parent category with the updated subcategory list
        return categorieRepository.save(parent);
    }

    @Override
    public Categorie removeSubcategory(String idCategorieParent, String idSousCategorie) {
        // Fetch the parent category
        Categorie parent = categorieRepository.findById(idCategorieParent)
                .orElseThrow(() -> new RuntimeException("Catégorie parente non trouvée"));

        // Find the subcategory to remove
        SousCategorie sousCategorieToRemove = null;
        if (parent.getSousCategories() != null) {
            for (SousCategorie sousCategorie : parent.getSousCategories()) {
                if (sousCategorie.getIdSousCategorie().equals(idSousCategorie)) {
                    sousCategorieToRemove = sousCategorie;
                    break;
                }
            }
        }

        // Remove the subcategory if found
        if (sousCategorieToRemove != null) {
            // Remove the subcategory reference from the parent's list
            parent.getSousCategories().remove(sousCategorieToRemove);

            // Save the updated parent category
            categorieRepository.save(parent);

            // Optionally, delete the subcategory document from the 'souscategorie' collection
            sousCategorieRepository.deleteById(idSousCategorie);

            return parent; // Return the updated parent category
        } else {
            throw new RuntimeException("Sous-catégorie non trouvée dans la catégorie parente");
        }
    }

    @Override
    public List<Categorie> getAllCategoriesWithSubcategories() {
        // Retrieve all categories (this may not fetch subcategories in the same query, depending on lazy loading behavior)
        return categorieRepository.findAll();
    }
}
