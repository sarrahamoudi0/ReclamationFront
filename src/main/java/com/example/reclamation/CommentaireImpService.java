package com.example.reclamation;

import com.example.reclamation.email.EmailService;
import com.example.reclamation.email.EmailTemplateName;
import com.example.reclamation.role.Role;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserService;
import jakarta.mail.MessagingException;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;


import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
@Service
public class CommentaireImpService implements ICommentaireService {
    @Autowired
    private CommentaireRepository commentaireRepository;
    private final ReclamationImpService reclamationService;
    private final UserService userService;
    private final EmailService emailService;

    @Override
    public Commentaire addComment(String idReclamation, String contenu)throws MessagingException  {
        User currentUser = userService.getCurrentUser();
        Reclamation reclamation = reclamationService.getReclamationById(idReclamation);

        Commentaire commentaire = new Commentaire();
        commentaire.setReclamation(reclamation);
        commentaire.setUser(currentUser);
        commentaire.setContenu(contenu);
        commentaire.setDateCommentaire(LocalDateTime.now());

        Commentaire savedCommentaire = commentaireRepository.save(commentaire);
        if (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_AGENT) {
            User client = reclamation.getUser();
            String emailClient = client.getEmail();
            String lienFront = "http://localhost:4200/reclamation/" + reclamation.getIdReclamation();
            String sujet = "Nouveau commentaire sur votre réclamation";

            Context context = new Context();
            context.setVariable("username", client.getFullName());
            context.setVariable("confirmationUrl", lienFront);
            context.setVariable("commentaire", contenu);

            emailService.sendEmail(
                    emailClient,
                    client.getFullName(),
                    EmailTemplateName.commentaire_notification,
                    lienFront,
                    "",
                    sujet
            );
        }

        return savedCommentaire;
    }


    @Override
    public Commentaire addCommentInterne(String idReclamation, String contenu) throws MessagingException {
        User currentUser = userService.getCurrentUser();

        if (!(currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_AGENT)) {
            throw new SecurityException("Seuls les agents et admins peuvent créer des commentaires internes.");
        }

        Reclamation reclamation = reclamationService.getReclamationById(idReclamation);

        Commentaire commentaire = new Commentaire();
        commentaire.setReclamation(reclamation);
        commentaire.setUser(currentUser);
        commentaire.setContenu(contenu);
        commentaire.setInterne(true);
        commentaire.setDateCommentaire(LocalDateTime.now());

        return commentaireRepository.save(commentaire);
    }

    @Override
    public List<Commentaire> getCommentairesByReclamation(String idReclamation) {
        return commentaireRepository.findByReclamationIdReclamation(idReclamation);
    }

    @Override
    public Commentaire updateCommentaire(Commentaire commentaire){
        return commentaireRepository.save(commentaire);
    }
    @Override
    public void deleteCommentaire(String id) {

        commentaireRepository.deleteById(id);
    }
    @Override
    public Commentaire getCommentaireyId(String id) {

        return commentaireRepository.findById(id).orElse(null);
    }

    @Override
    public List<Commentaire> getCommentairesInternes(String idReclamation) {
        User user = userService.getCurrentUser();
        if (user.getRole() == Role.ROLE_USER) {
            throw new SecurityException("Access denied");
        }

        return commentaireRepository.findByReclamationIdReclamation(idReclamation)
                .stream()
                .filter(Commentaire::isInterne)
                .toList();
    }

}
