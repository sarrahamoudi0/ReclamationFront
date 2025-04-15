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
        // Fetch all reclamations from the database
        List<Reclamation> reclamations = reclamationRepository.findAll();

        // Log the number of reclamations fetched for debugging
        System.out.println("Number of reclamations fetched: " + reclamations.size());

        // Return the fetched list of reclamations
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

}
