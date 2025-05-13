package com.example.reclamation;

import com.example.reclamation.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReclamationImpService implements IReclamationService {

    @Autowired
    private ReclamationRepository reclamationRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    @Override
    public Reclamation createReclamation(Reclamation reclamation, String idCategorie, String idSousCategorie) {
        // Retrieve category by ID
        Categorie categorie = categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new RuntimeException("Category with ID " + idCategorie + " not found"));

        // Find the sub-category by its ID in the list of sub-categories of the retrieved category
        SousCategorie sousCategorie = categorie.getSousCategories().stream()
                .filter(sub -> sub.getIdSousCategorie().equals(idSousCategorie)) // Corrected field name for subcategory ID
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sub-category with ID " + idSousCategorie + " not found"));

        // Assign the category and sub-category to the reclamation
        reclamation.setCategorie(categorie);
        reclamation.setSousCategorie(sousCategorie);

        // Save the reclamation and return
        return reclamationRepository.save(reclamation);
    }


    @Override
    public List<Reclamation> getAllReclamations() {
        List<Reclamation> reclamations = reclamationRepository.findAll();

        // Ensure that subcategories are properly loaded
        for (Reclamation reclamation : reclamations) {
            if (reclamation.getCategorie() != null && reclamation.getCategorie().getSousCategories().isEmpty()) {
                Categorie categorie = reclamation.getCategorie();
                categorie.setSousCategories(categorieRepository.findByIdCategorie(categorie.getIdCategorie()));
            }
        }

        return reclamations;
    }

    @Override
    public Reclamation updateReclamation(Reclamation reclamation) {
        return reclamationRepository.save(reclamation);
    }

    @Override
    public void deleteReclamation(String id) {
        reclamationRepository.deleteById(id);
    }

    @Override
    public Reclamation getReclamationById(String id) {
        return reclamationRepository.findById(id).orElse(null);
    }

    @Override
    public Reclamation updateStatut(String id, Statut statut) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + id));
        reclamation.setStatut(statut);
        return reclamationRepository.save(reclamation);
    }

    @Override
    public Reclamation updatePriority(String id, Priorite priority) {
        Reclamation reclamation = reclamationRepository.findById(id).orElse(null);

        if (reclamation != null) {
            reclamation.setPriorite(priority);
            return reclamationRepository.save(reclamation);
        }

        return null; // Return null if reclamation not found
    }

    @Override
    public List<Reclamation> getReclamationsByUser(User user) {
        return reclamationRepository.findByUser(user);
    }

    @Override
    public Reclamation assignCategorieToReclamation(String idReclamation, String idCategorie) {
        Reclamation reclamation = reclamationRepository.findById(idReclamation)
                .orElseThrow(() -> new RuntimeException("Reclamation not found"));

        Categorie categorie = categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        reclamation.setCategorie(categorie);
        return reclamationRepository.save(reclamation);
    }

    @Override
    public Reclamation assignOneCategorieToReclamation(String idReclamation, String idCategorie, String idSousCategorie) {
        // Validate that none of the IDs are null
        if (idReclamation == null || idCategorie == null || idSousCategorie == null) {
            throw new IllegalArgumentException("Identifiers cannot be null");
        }

        // Retrieve the reclamation, category, and sub-category
        Reclamation reclamation = reclamationRepository.findById(idReclamation)
                .orElseThrow(() -> new RuntimeException("Reclamation not found"));

        Categorie categoriePrincipale = categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new RuntimeException("Main category not found"));

        Categorie sousCategorie = categorieRepository.findById(idSousCategorie)
                .orElseThrow(() -> new RuntimeException("Sub-category not found"));

        // Ensure that the sub-category belongs to the main category
        boolean isValidSousCategorie = categoriePrincipale.getSousCategories().stream()
                .anyMatch(sc -> sc.getIdCategorie().equals(idSousCategorie));

        if (!isValidSousCategorie) {
            throw new RuntimeException("Sub-category does not belong to the provided category");
        }

        // Assign the sub-category to the reclamation
        reclamation.setCategorie(sousCategorie);

        return reclamationRepository.save(reclamation);
    }
}
