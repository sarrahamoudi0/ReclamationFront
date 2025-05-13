package com.example.reclamation;

import com.example.reclamation.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReclamationImpService implements IReclamationService{
    @Autowired
    private ReclamationRepository reclamationRepository;
    @Autowired
    private  CategorieRepository categorieRepository;


@Override
    public Reclamation createReclamation(Reclamation reclamation, String idCategorie, String idSousCategorie) {
        // Get the category and sub-category
        Categorie categorie = categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new RuntimeException("Categorie not found"));
        Categorie sousCategorie = categorie.getSousCategories().stream()
                .filter(sub -> sub.getIdCategorie().equals(idSousCategorie))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sous-Categorie not found"));

        // Assign the category and sub-category to the reclamation
        reclamation.setCategorie(categorie);
        reclamation.setSousCategorie(sousCategorie);

        // Save the reclamation
        return reclamationRepository.save(reclamation);
    }

    public List<Reclamation> getAllReclamations() {
        List<Reclamation> reclamations = reclamationRepository.findAll();
        for (Reclamation reclamation : reclamations) {
            if (reclamation.getCategorie() != null) {
                // Manually load subcategories if not automatically populated
                Categorie categorie = reclamation.getCategorie();
                if (categorie.getSousCategories() == null || categorie.getSousCategories().isEmpty()) {
                    // Load subcategories manually using the repository method
                    categorie.setSousCategories(categorieRepository.findByIdCategorie(categorie.getIdCategorie()));
                }
            }
        }
        return reclamations;
    }


    @Override
    public Reclamation updateReclamation(Reclamation reclamation){
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
                .orElseThrow(() -> new RuntimeException("Réclamation non trouvée avec id: " + id));
        reclamation.setStatut(statut);
        return reclamationRepository.save(reclamation);
    }

    @Override
    public Reclamation updatePriority(String id, Priorite priority) {
        // Find the reclamation by its ID
        Reclamation reclamation = reclamationRepository.findById(id).orElse(null);

        if (reclamation != null) {
            // Set the new priority
            reclamation.setPriorite(priority);
            // Save the updated reclamation back to MongoDB
            return reclamationRepository.save(reclamation);
        }

        // Return null if the reclamation is not found
        return null;
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
                .orElseThrow(() -> new RuntimeException("Categorie not found"));

        reclamation.setCategorie(categorie);

        return reclamationRepository.save(reclamation);
    }


    @Override
    public Reclamation assignOneCategorieToReclamation(String idReclamation, String idCategorie, String idSousCategorie) {
        if (idReclamation == null || idCategorie == null || idSousCategorie == null) {
            throw new IllegalArgumentException("Les identifiants ne doivent pas être null");
        }

        // Récupération de la réclamation
        Reclamation reclamation = reclamationRepository.findById(idReclamation)
                .orElseThrow(() -> new RuntimeException("Réclamation non trouvée"));

        // Récupération de la catégorie principale
        Categorie categoriePrincipale = categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));

        // Récupération de la sous-catégorie
        Categorie sousCategorie = categorieRepository.findById(idSousCategorie)
                .orElseThrow(() -> new RuntimeException("Sous-catégorie non trouvée"));

        // Vérifie si la sous-catégorie est bien incluse dans la catégorie principale
        boolean isValidSousCategorie = categoriePrincipale.getSousCategories()
                .stream()
                .anyMatch(sc -> sc.getIdCategorie().equals(idSousCategorie));

        if (!isValidSousCategorie) {
            throw new RuntimeException("La sous-catégorie ne correspond pas à la catégorie fournie");
        }

        // Affectation
        reclamation.setCategorie(sousCategorie); // tu assignes la sous-catégorie directement ici, selon ton design

        return reclamationRepository.save(reclamation);
    }







}
