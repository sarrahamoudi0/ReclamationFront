package com.example.reclamation;

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
            @RequestParam(value = "image_reclamation", required = false) MultipartFile fileReclamation) throws IOException {

        // Fetch the current authenticated user
        User currentUser = getCurrentUser();

        Reclamation reclamation = new Reclamation();

        reclamation.setTitre(titre);
        reclamation.setDescription(description);

        // Associate the reclamation with the authenticated user
        reclamation.setUser(currentUser); // Assuming 'user' is the field that references User

        if (fileReclamation != null) {
            reclamation.setImage_reclamation(fileReclamation.getBytes());
        }

        // Save the reclamation with the associated user
        Reclamation savedReclamation = reclamationService.createReclamation(reclamation);
        return ResponseEntity.ok(savedReclamation);
    }
    @GetMapping("/getMyReclamations")
    public List<Reclamation> getMyReclamations() {
        User currentUser = userService.getCurrentUser();
        return reclamationService.getReclamationsByUser(currentUser);
    }

    @GetMapping("/getAllReclamations")
    public List<Reclamation> getAllReclamations() {
        // You could optionally check if the current user has an ADMIN role
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
