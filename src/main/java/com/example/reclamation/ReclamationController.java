package com.example.reclamation;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;


@RestController
@NoArgsConstructor
@AllArgsConstructor
@RequestMapping("/project")
@CrossOrigin("*")
public class ReclamationController {
    @Autowired
    private IReclamationService reclamationService;


    @PostMapping("/addReclamation")
    public ResponseEntity<Reclamation> createReclamation(
            @RequestParam("nom") String nom,
            @RequestParam("prenom") String prenom,
            @RequestParam("email") String email,
            @RequestParam("num") String num,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam(value = "image_reclamation", required = false) MultipartFile fileReclamation) throws IOException {

        Reclamation reclamation = new Reclamation();
        reclamation.setNom(nom);
        reclamation.setPrenom(prenom);
        reclamation.setNum(num);
        reclamation.setEmail(email);
        reclamation.setTitre(titre);
        reclamation.setDescription(description);
        reclamation.setImage_reclamation(fileReclamation.getBytes());

        Reclamation savedReclamation = reclamationService.createReclamation(reclamation);
        return ResponseEntity.ok(savedReclamation);
    }


    @GetMapping("/getAllReclamation")
    public List<Reclamation> getAllReclamation() {

        return reclamationService.getAllReclamations();
    }

    @PutMapping("/updateReclamation")
    public ResponseEntity<Reclamation> updateReclamation(
            @RequestParam("idReclamation") String idReclamation,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam(value = "image_reclamation", required = false) MultipartFile image_reclamation) throws IOException {

        // Get the reclamation by ID
        Reclamation reclamation = reclamationService.getReclamationById(idReclamation);

        // Update the other fields
        reclamation.setTitre(titre);
        reclamation.setDescription(description);

        // If there's a new image, update it; otherwise, keep the old image
        if (image_reclamation != null) {
            reclamation.setImage_reclamation(image_reclamation.getBytes());
        }

        // Save the updated reclamation
        Reclamation updatedReclamation = reclamationService.updateReclamation(reclamation);

        return ResponseEntity.ok(updatedReclamation);
    }


    @DeleteMapping("/remove/{reclamation-id}")
    public void deleteReclamation(@PathVariable("reclamation-id") String id) {

        reclamationService.deleteReclamation(id);
    }

    @GetMapping("/getReclamationById/{id}")
    public Reclamation getReclamationById(@PathVariable String id) {

        return reclamationService.getReclamationById(id);
    }

    @PutMapping("/updateReclamationStatut/{id}")
    public ResponseEntity<Reclamation> updateReclamationStatut(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {

        String newStatut = request.get("statut");
        try {
            // Convert the incoming string to the Statut enum
            Statut statutEnum = Statut.valueOf(newStatut);
            Reclamation updated = reclamationService.updateStatut(id, statutEnum);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null); // Return 400 if statut invalid
        }
    }

    @PutMapping("/{id}/priority")
    public ResponseEntity<Reclamation> updatePriority(
            @PathVariable("id") String id,
            @RequestParam("priority") Priorite priority) {

        // Call the service to update the priority
        Reclamation updatedReclamation = reclamationService.updatePriority(id, priority);

        // Check if the reclamation was found and updated
        if (updatedReclamation != null) {
            return ResponseEntity.ok(updatedReclamation);
        } else {
            return ResponseEntity.notFound().build(); // Return 404 if reclamation is not found
        }
    }


    }
