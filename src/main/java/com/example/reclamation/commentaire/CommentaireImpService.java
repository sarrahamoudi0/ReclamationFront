package com.example.reclamation.commentaire;

import com.example.reclamation.Event.EventType;
import com.example.reclamation.Event.ReclamationEventService;
import com.example.reclamation.email.EmailService;
import com.example.reclamation.email.EmailTemplateName;
import com.example.reclamation.reclamation.Reclamation;
import com.example.reclamation.reclamation.ReclamationImpService;
import com.example.reclamation.reclamation.Statut;
import com.example.reclamation.role.Role;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserService;
import jakarta.mail.MessagingException;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;


import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@Service
public class CommentaireImpService implements ICommentaireService {
    @Autowired
    private CommentaireRepository commentaireRepository;
    private final ReclamationImpService reclamationService;
    private final UserService userService;
    private final EmailService emailService;
    private final ReclamationEventService eventService;

    @Override
    public Commentaire addComment(String idReclamation, String contenu)throws MessagingException  {
        User currentUser = userService.getCurrentUser();
        Reclamation reclamation = reclamationService.getReclamationById(idReclamation);
        if (reclamation.getStatut() == Statut.Escalé && currentUser.getRole() == Role.ROLE_AGENT) {
            throw new RuntimeException("Les agents ne peuvent pas commenter une réclamation escalée.");
        }


        Commentaire commentaire = new Commentaire();
        commentaire.setReclamation(reclamation);
        commentaire.setUser(currentUser);
        commentaire.setContenu(contenu);
        commentaire.setInterne(false);
        commentaire.setDateCommentaire(LocalDateTime.now());

        Commentaire savedCommentaire = commentaireRepository.save(commentaire);
        // Loguer l'événement dans la timeline via eventService
        String description = "Nouveau commentaire ajouté par " + currentUser.getFullName();
        eventService.logEvent(
                currentUser,
                reclamation,
                EventType.COMMENTAIRE_AJOUTER,  // Assure-toi que cette valeur existe dans ton enum EventType
                description
        );

        if (currentUser.getRole() == Role.ROLE_ADMIN || currentUser.getRole() == Role.ROLE_AGENT) {
            User client = reclamation.getUser();
            String emailClient = client.getEmail();
            String lienFront = "http://localhost:4200/reclamation/" + reclamation.getIdReclamation();
            String sujet = "Nouveau commentaire sur cette réclamation";

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

        Reclamation reclamation = reclamationService.getReclamationById(idReclamation);
        if (reclamation.getStatut() == Statut.Escalé && currentUser.getRole() == Role.ROLE_AGENT) {
            throw new RuntimeException("Les agents ne peuvent pas commenter une réclamation escalée.");
        }


        Commentaire commentaire = new Commentaire();
        commentaire.setReclamation(reclamation);
        commentaire.setUser(currentUser);
        commentaire.setContenu(contenu);
        commentaire.setInterne(true);
        commentaire.setDateCommentaire(LocalDateTime.now());

        Commentaire savedCommentaire = commentaireRepository.save(commentaire);

        // Loguer l'événement dans la timeline
        String description = "Nouveau commentaire interne ajouté par " + currentUser.getFullName();
        eventService.logEvent(
                currentUser,
                reclamation,
                EventType.COMMENTAIRE_AJOUTER, // ajoute cette valeur dans ton enum EventType
                description
        );

        return savedCommentaire;
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
