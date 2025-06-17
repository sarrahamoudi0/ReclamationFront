package com.example.reclamation;

import com.example.reclamation.role.Role;
import com.example.reclamation.user.User;
import jakarta.mail.MessagingException;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@NoArgsConstructor
@AllArgsConstructor
@RequestMapping("/commentaire")
@CrossOrigin("*")
public class CommentaireController {
    @Autowired
    private  ICommentaireService commentaireService;

    @PostMapping("/{idReclamation}")
    public ResponseEntity<?> addComment(
            @PathVariable String idReclamation,
            @RequestParam String contenu) {
        try {
            Commentaire savedCommentaire = commentaireService.addComment(idReclamation, contenu);
            return ResponseEntity.ok(savedCommentaire);
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'envoi du mail : " + e.getMessage());
        }
    }

    @GetMapping("/commentaire/{idReclamation}")
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
