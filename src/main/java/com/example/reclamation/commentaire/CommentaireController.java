package com.example.reclamation.commentaire;

import com.example.reclamation.logs.AuditLogService;
import com.example.reclamation.role.Role;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserService;
import jakarta.mail.MessagingException;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@NoArgsConstructor
@AllArgsConstructor
@RequestMapping("/commentaire")
@CrossOrigin("*")
public class CommentaireController {
    @Autowired
    private  ICommentaireService commentaireService;
    @Autowired
    AuditLogService auditLogService;
    @Autowired
    UserService userService;

    @PostMapping("/{idReclamation}")
    public ResponseEntity<?> addComment(
            @PathVariable String idReclamation,
            @RequestParam String contenu) {
        try {
            Commentaire savedCommentaire = commentaireService.addComment(idReclamation, contenu);

            User currentUser = getCurrentUser();

            if (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_AGENT) {
                // Message clair, l'ID est uniquement pour le lien
                String details = String.format(
                        "Commentaire public ajouté par %s. Réclamation ID: %s",
                        currentUser.getFullName(),
                        idReclamation
                );
                auditLogService.logAction(currentUser.getEmail(), "COMMENTAIRE PUBLIC", details);
            }

            return ResponseEntity.ok(savedCommentaire);

        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'envoi du mail : " + e.getMessage());
        }
    }

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

    @GetMapping("/getcommentaire/{idReclamation}")
    public ResponseEntity<List<Commentaire>> getCommentairesByReclamation(@PathVariable String idReclamation) {
        List<Commentaire> commentaires = commentaireService.getCommentairesByReclamation(idReclamation);
        return ResponseEntity.ok(commentaires);
    }


    @PutMapping("/updateCommentaire")
    public Commentaire updateCommentaire(@RequestBody Commentaire commentaire){

        return commentaireService.updateCommentaire(commentaire);
    }
    @DeleteMapping("/remove/{commentaire-id}")
    public void deleteCommentaire(@PathVariable("commentaire-id")String id){

        commentaireService.deleteCommentaire(id);
    }

    @GetMapping("/getCommentaireById/{id}")
    public Commentaire getCommentaireById(@PathVariable String id) {

        return commentaireService.getCommentaireyId(id);
    }

    @PostMapping("/add/interne/{idReclamation}")
    public ResponseEntity<?> addCommentInterne(
            @PathVariable String idReclamation,
            @RequestParam String contenu) {
        try {
            Commentaire savedCommentaire = commentaireService.addCommentInterne(idReclamation, contenu);

            User currentUser = getCurrentUser();

            if (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_AGENT) {
                String details = "Commentaire interne ajouté à la réclamation par " + currentUser.getFullName() + ". Réclamation ID: " + idReclamation;
                auditLogService.logAction(currentUser.getEmail(), "COMMENTAIRE INTERNE", details);
            }

            return ResponseEntity.ok(savedCommentaire);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'envoi du mail : " + e.getMessage());
        }
    }

    @GetMapping("/internes/{idReclamation}")
    public ResponseEntity<List<Commentaire>> getCommentairesInternes(@PathVariable String idReclamation) {
        try {
            List<Commentaire> internes = commentaireService.getCommentairesInternes(idReclamation);
            return ResponseEntity.ok(internes);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        }
    }


}
