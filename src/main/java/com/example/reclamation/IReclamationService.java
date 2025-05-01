package com.example.reclamation;

import java.util.List;

public interface IReclamationService {
    Reclamation createReclamation(Reclamation reclamation);
    List<Reclamation> getAllReclamations();

    Reclamation updateReclamation(Reclamation reclamation);
    void deleteReclamation(String id);
    Reclamation getReclamationById(String id);
    Reclamation updateStatut(String id, Statut statut);
    Reclamation updatePriority(String id, Priorite priority);

}
