package com.example.reclamation;

import com.example.reclamation.Event.ReclamationEvent;
import com.example.reclamation.Event.ReclamationEventService;
import com.example.reclamation.role.Role;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @Autowired
    private UserService userService;
    @Autowired
    private ReclamationEventService eventService;

    // Helper method to get the current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Ensure the user is authenticated
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }

        String email = authentication.getName(); // getName() returns the principal, which is the email in this case

        // Use UserService to find the user by email
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/addReclamation")
    public ResponseEntity<Reclamation> createReclamation(
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam(value = "image_reclamation", required = false) MultipartFile fileReclamation,
            @RequestParam("idCategorie") String idCategorie,
            @RequestParam("idSousCategorie") String idSousCategorie) throws IOException {

        // ► Récupérer l'utilisateur authentifié
        User currentUser = getCurrentUser();

        // ► Créer et remplir la réclamation
        Reclamation reclamation = new Reclamation();
        reclamation.setTitre(titre);
        reclamation.setDescription(description);
        reclamation.setUser(currentUser);
        reclamation.setStatut(Statut.Nouveau);
        reclamation.setPriorite(Priorite.Faible);

        if (fileReclamation != null) {
            reclamation.setImage_reclamation(fileReclamation.getBytes());
        }

        // ► Appeler le service AVEC l'utilisateur
        Reclamation createdReclamation = reclamationService.createReclamation(
                reclamation,
                idCategorie,
                idSousCategorie,
                currentUser
        );

        return ResponseEntity.ok(createdReclamation);
    }




    @GetMapping("/getMyReclamations")
    public List<Reclamation> getMyReclamations() {
        User currentUser = userService.getCurrentUser();
        return reclamationService.getReclamationsByUser(currentUser);
    }

    @GetMapping("/getAllReclamations")
    public List<Reclamation> getAllReclamations() {
        User currentUser = getCurrentUser();

        // Vérifier si l'utilisateur a le rôle ADMIN ou AGENT
        if (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_AGENT) {
            return reclamationService.getAllReclamations();  // Retourner toutes les réclamations
        } else {
            throw new RuntimeException("Accès interdit. L'utilisateur n'a pas les droits nécessaires.");
        }
    }




    @PutMapping("/updateReclamation")
    public ResponseEntity<Reclamation> updateReclamation(
            @RequestParam("idReclamation") String idReclamation,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam(value = "image_reclamation", required = false) MultipartFile image_reclamation)
            throws IOException {

        // ► 1. Récupérer la réclamation existante
        Reclamation reclamation = reclamationService.getReclamationById(idReclamation);
        if (reclamation == null) {
            return ResponseEntity.notFound().build();
        }

        // ► 2. Mettre à jour les champs
        reclamation.setTitre(titre);
        reclamation.setDescription(description);
        if (image_reclamation != null) {
            reclamation.setImage_reclamation(image_reclamation.getBytes());
        }

        // ► 3. Récupérer l’utilisateur connecté
        User currentUser = getCurrentUser();   // helper ci‑dessous

        // ► 4. Appeler le service AVEC l’utilisateur
        Reclamation updated = reclamationService.updateReclamation(reclamation, currentUser);

        return ResponseEntity.ok(updated);
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
            Statut statutEnum = Statut.valueOf(newStatut);

            // Récupérer l'utilisateur courant
            User currentUser = userService.getCurrentUser();

            Reclamation updated = reclamationService.updateStatut(id, statutEnum, currentUser);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}/priority")
    public ResponseEntity<Reclamation> updatePriority(
            @PathVariable("id") String id,
            @RequestParam("priority") Priorite priority) {

        // Call the service to update the priority
        User currentUser = getCurrentUser();

        Reclamation updatedReclamation = reclamationService.updatePriority(id, priority,currentUser);

        // Check if the reclamation was found and updated
        if (updatedReclamation != null) {
            return ResponseEntity.ok(updatedReclamation);
        } else {
            return ResponseEntity.notFound().build(); // Return 404 if reclamation is not found
        }
    }

    @PutMapping("/{idReclamation}/assign-categorie/{idCategorie}")
    public ResponseEntity<Reclamation> assignCategorie(
            @PathVariable String idReclamation,
            @PathVariable String idCategorie) {
        Reclamation updated = reclamationService.assignCategorieToReclamation(idReclamation, idCategorie);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{idReclamation}/assign-categorie")
    public Reclamation assignCategorieToReclamation(
            @PathVariable String idReclamation,
            @RequestParam String idCategorie,
            @RequestParam String idSousCategorie) {
        return reclamationService.assignOneCategorieToReclamation(idReclamation, idCategorie, idSousCategorie);
    }

    @PutMapping("/{idReclamation}/update-categorie")
    public Reclamation updateCategorieToReclamation(
            @PathVariable String idReclamation,
            @RequestParam String idCategorie,
            @RequestParam String idSousCategorie) {
        User currentUser = getCurrentUser();

        return reclamationService.updateCategorieOfReclamation(idReclamation, idCategorie, idSousCategorie,currentUser);
    }

    @GetMapping("/reclamation/{idReclamation}/events")
    public ResponseEntity<List<ReclamationEvent>> getEventsByReclamation(@PathVariable String idReclamation) {
        Reclamation reclamation = reclamationService.getReclamationById(idReclamation);
        if (reclamation == null) {
            return ResponseEntity.notFound().build();
        }

        List<ReclamationEvent> events = eventService.getEventsForReclamation(reclamation);
        return ResponseEntity.ok(events);
    }


}
