package com.example.reclamation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service

public class CategorieImpService implements ICategorieService  {

    @Autowired
    private CategorieRepository categorieRepository;
    @Override
    public Categorie createCategorie(Categorie categorie) {
        return categorieRepository.save(categorie);
    }
    @Override
    public List<Categorie> getAllCategories() {

    return categorieRepository.findAll();
    }
    @Override
    public Categorie updateCategorie(Categorie categorie){
        return categorieRepository.save(categorie);
    }
    @Override
    public void deleteCategorie(String id) {

        categorieRepository.deleteById(id);
    }
    @Override
    public Categorie getCategorieById(String id) {

        return categorieRepository.findById(id).orElse(null);
    }


    @Override
    public Categorie ajouterSousCategorie(String idCategorieParent, String nomSousCategorie) {
        // Récupère la catégorie parente
        Categorie parent = categorieRepository.findById(idCategorieParent)
                .orElseThrow(() -> new RuntimeException("Catégorie parente non trouvée"));

        // Crée et sauvegarde la sous-catégorie
        Categorie sousCategorie = new Categorie();
        sousCategorie.setNomCategorie(nomSousCategorie);
        sousCategorie.setSousCategories(new ArrayList<>());

        // Save and fetch to ensure ID is populated
        Categorie savedSub = categorieRepository.save(sousCategorie);

        // Initialise la liste du parent si besoin
        if (parent.getSousCategories() == null) {
            parent.setSousCategories(new ArrayList<>());
        }

        // Add the fully saved sub-category with valid ID
        parent.getSousCategories().add(savedSub);

        // Sauvegarde et renvoie le parent mis à jour
        return categorieRepository.save(parent);
    }
@Override
    public List<Categorie> getAllCategoriesWithSubcategories() {
        // Fetch all categories from the repository
        List<Categorie> categories = categorieRepository.findAll();
        return categories; // Return the categories including subcategories
    }


    @Override
    public Categorie supprimerSousCategorie(String idCategorieParent, String idSousCategorie) {
        // Fetch the parent category
        Categorie parent = categorieRepository.findById(idCategorieParent)
                .orElseThrow(() -> new RuntimeException("Catégorie parente non trouvée"));

        // Find the sub-category to be removed
        Categorie sousCategorieToRemove = null;
        if (parent.getSousCategories() != null) {
            for (Categorie sousCategorie : parent.getSousCategories()) {
                if (sousCategorie.getIdCategorie().equals(idSousCategorie)) {
                    sousCategorieToRemove = sousCategorie;
                    break;
                }
            }
        }

        if (sousCategorieToRemove != null) {
            // Remove the sub-category reference from the parent
            parent.getSousCategories().remove(sousCategorieToRemove);

            // Save the updated parent category
            categorieRepository.save(parent);

            // Optionally, delete the sub-category document itself
            categorieRepository.deleteById(idSousCategorie);

            return parent;  // Return updated parent
        } else {
            throw new RuntimeException("Sous-catégorie non trouvée dans la catégorie parente");
        }
    }



}
