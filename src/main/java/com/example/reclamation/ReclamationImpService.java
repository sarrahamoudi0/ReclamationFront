package com.example.reclamation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReclamationImpService implements IReclamationService{
    @Autowired
    private ReclamationRepository reclamationRepository;
    @Autowired
    private CommentaireRepository commentaireRepository;


    @Override
    public Reclamation createReclamation(Reclamation reclamation) {
        return reclamationRepository.save(reclamation);
    }

@Override
public List<Reclamation> getAllReclamations() {

    return reclamationRepository.findAll();
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


}
