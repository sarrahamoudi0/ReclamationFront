package com.example.reclamation;

import com.example.reclamation.Event.EventType;
import com.example.reclamation.Event.ReclamationEvent;
import com.example.reclamation.Event.ReclamationEventRepository;
import com.example.reclamation.Event.ReclamationEventService;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReclamationImpService implements IReclamationService {

    @Autowired
    private ReclamationRepository reclamationRepository;

    @Autowired
    private CategorieRepository categorieRepository;
    @Autowired
    private SousCategorieRepository sousCategorieRepository;
    @Autowired
    private ReclamationEventRepository EventRepo;
    @Autowired
    private ReclamationEventService reclamationEventService;


    @Override
    public Reclamation createReclamation(Reclamation reclamation, String idCategorie, String idSousCategorie, User currentUser) {
        // ► Récupérer la catégorie
        Categorie categorie = categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new RuntimeException("Category with ID " + idCategorie + " not found"));

        // ► Récupérer la sous-catégorie
        SousCategorie sousCategorie = categorie.getSousCategories().stream()
                .filter(sub -> sub.getIdSousCategorie().equals(idSousCategorie))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sub-category with ID " + idSousCategorie + " not found"));

        // ► Assigner la catégorie et sous-catégorie
        reclamation.setCategorie(categorie);
        reclamation.setSousCategorie(sousCategorie);

        // ► Sauvegarder
        Reclamation saved = reclamationRepository.save(reclamation);

        // ► Ajouter à la timeline
        reclamationEventService.logEvent(
                currentUser,
                saved,
                EventType.CREATION,
                "Réclamation créée dans la catégorie '" + categorie.getNom() + "' / sous-catégorie '" + sousCategorie.getNomSousCategorie() + "'"
        );

        return saved;
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
    public Reclamation updateReclamation(Reclamation reclamation, User currentUser) {
        Reclamation oldReclamation = reclamationRepository.findById(reclamation.getIdReclamation())
                .orElseThrow(() -> new RuntimeException("Reclamation not found"));

        String ancienTitre = oldReclamation.getTitre();
        String ancienneDescription = oldReclamation.getDescription();
        byte[] ancienneImage = oldReclamation.getImage_reclamation();

        boolean titreChanged = !ancienTitre.equals(reclamation.getTitre());
        boolean descriptionChanged = !ancienneDescription.equals(reclamation.getDescription());
        boolean imageChanged = (reclamation.getImage_reclamation() != null && !java.util.Arrays.equals(ancienneImage, reclamation.getImage_reclamation()));

        Reclamation saved = reclamationRepository.save(reclamation);

        if (titreChanged) {
            reclamationEventService.logEvent(
                    currentUser,
                    saved,
                    EventType.TITRE_CHANGER,
                    "Titre changé de '" + ancienTitre + "' à '" + reclamation.getTitre() + "'"
            );
        }

        if (descriptionChanged) {
            reclamationEventService.logEvent(
                    currentUser,
                    saved,
                    EventType.DESCRIPTION_CHANGER,
                    "Description modifiée"
            );
        }

        if (imageChanged) {
            reclamationEventService.logEvent(
                    currentUser,
                    saved,
                    EventType.IMAGE_CHANGER,
                    "Image mise à jour"
            );
        }

        // Si aucun changement détecté, tu peux logger une mise à jour générique si tu veux :
        if (!titreChanged && !descriptionChanged && !imageChanged) {
            reclamationEventService.logEvent(
                    currentUser,
                    saved,
                    EventType.MODIFICATION,
                    "Réclamation enregistrée sans modification de contenu détectée"
            );
        }

        return saved;
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
    public Reclamation updateStatut(String id, Statut statut, User currentUser) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + id));

        Statut ancienStatut = reclamation.getStatut();
        reclamation.setStatut(statut);
        Reclamation saved = reclamationRepository.save(reclamation);

        reclamationEventService.logEvent(
                currentUser,
                saved,
                EventType.STATUT_CHANGER,
                "Statut changé de '" + ancienStatut.name() + "' à '" + statut.name() + "'"
        );

        return saved;
    }


    @Override
    public Reclamation updatePriority(String id, Priorite priority, User currentUser) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + id));

        Priorite anciennePriorite = reclamation.getPriorite();
        reclamation.setPriorite(priority);
        Reclamation saved = reclamationRepository.save(reclamation);

        reclamationEventService.logEvent(
                currentUser,
                saved,
                EventType.PRIORITE_CHANGER,
                "Priorité changée de '" + (anciennePriorite != null ? anciennePriorite.name() : "null") + "' à '" + priority.name() + "'"
        );

        return saved;
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


    @Override
    public Reclamation updateCategorieOfReclamation(String idReclamation, String idCategorie, String idSousCategorie, User currentUser) {
        Reclamation reclamation = getReclamationById(idReclamation);

        Categorie ancienneCategorie = reclamation.getCategorie();
        SousCategorie ancienneSousCategorie = reclamation.getSousCategorie();

        Categorie categorie = categorieRepository.findById(idCategorie)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        SousCategorie sousCategorie = sousCategorieRepository.findById(idSousCategorie)
                .orElseThrow(() -> new RuntimeException("Sous-catégorie non trouvée"));

        boolean sousCategorieValide = categorie.getSousCategories().stream()
                .anyMatch(sc -> sc.getIdSousCategorie().equals(idSousCategorie));
        if (!sousCategorieValide) {
            throw new RuntimeException("La sous-catégorie ne correspond pas à cette catégorie");
        }

        reclamation.setCategorie(categorie);
        reclamation.setSousCategorie(sousCategorie);
        Reclamation saved = reclamationRepository.save(reclamation);

        reclamationEventService.logEvent(
                currentUser,
                saved,
                EventType.CATEGORIE_CHANGER,
                "Catégorie changée de '" + (ancienneCategorie != null ? ancienneCategorie.getNom() : "null") +
                        "' à '" + categorie.getNom() + "', sous-catégorie changée de '" +
                        (ancienneSousCategorie != null ? ancienneSousCategorie.getNomSousCategorie() : "null") +
                        "' à '" + sousCategorie.getNomSousCategorie() + "'"
        );

        return saved;
    }

    public List<ReclamationEvent> getEventsForReclamation(String idReclamation) {
        Reclamation reclamation = reclamationRepository.findById(idReclamation)
                .orElseThrow(() -> new RuntimeException("Réclamation non trouvée"));
        return EventRepo.findByReclamationOrderByTimestampAsc(reclamation);
    }


}
