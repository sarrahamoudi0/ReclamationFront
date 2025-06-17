package com.example.reclamation;

import java.util.List;
import com.example.reclamation.user.User;

public interface IReclamationService {
    List<Reclamation> getReclamationsByUser(User user);
    List<Reclamation> getAllReclamations();
    Reclamation createReclamation(Reclamation reclamation, String idCategorie, String idSousCategorie,User currentUser);

    Reclamation updateReclamation(Reclamation reclamation,User currentUser);
    void deleteReclamation(String id);
    Reclamation getReclamationById(String id);
    Reclamation updateStatut(String id, Statut statut, User currentUser);
    Reclamation updatePriority(String id, Priorite priority, User currentUser);
     Reclamation assignCategorieToReclamation(String idReclamation, String idCategorie);
    Reclamation assignOneCategorieToReclamation(String idReclamation, String idCategorie, String idSousCategorie);

    Reclamation updateCategorieOfReclamation(String idReclamation, String idCategorie, String idSousCategorie,User currentUser);
}
