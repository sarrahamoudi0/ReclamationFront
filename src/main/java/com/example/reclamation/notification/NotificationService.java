package com.example.reclamation.notification;

import com.example.reclamation.reclamation.Reclamation;
import com.example.reclamation.role.Role;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyAdminsOnEscalade(Reclamation reclamation) {
        User escaladeur = reclamation.getActionPar(); // 👈 capturé dans updateStatut()
        String nomEscaladeur = escaladeur != null ? escaladeur.getFullName() : "un agent";

        String message = "Réclamation " + reclamation.getIdReclamation() + " escalée par " + nomEscaladeur + ".";

        List<User> admins = userRepository.findByRole(Role.ROLE_ADMIN);

        for (User admin : admins) {
            Notification notif = Notification.builder()
                    .message(message)
                    .date(LocalDateTime.now())
                    .status(NotificationStatus.NON_LUE)
                    .vue(false)
                    .destinataire(admin)
                    .actionPar(escaladeur)
                    .reclamationId(reclamation.getIdReclamation())
                    .build();

            notificationRepository.save(notif);

            messagingTemplate.convertAndSendToUser(
                    admin.getEmail(),
                    "/notifications",
                    notif
            );
        }
    }

    public void notifyAgentsOnPrioriteElevee(Reclamation reclamation, User prioriteur) {
        String nom = prioriteur != null ? prioriteur.getFullName() : "un agent";

        String message = "Réclamation " + reclamation.getIdReclamation()
                + " marquée comme priorité élevée par " + nom + ".";

        // Récupère tous les agents
        List<User> agents = userRepository.findByRole(Role.ROLE_AGENT);

        for (User agent : agents) {
            Notification notif = Notification.builder()
                    .message(message)
                    .date(LocalDateTime.now())
                    .status(NotificationStatus.NON_LUE)
                    .vue(false)
                    .destinataire(agent)
                    .actionPar(prioriteur) // Tu peux renommer ce champ à `actionPar` si tu préfères
                    .reclamationId(reclamation.getIdReclamation())
                    .build();

            notificationRepository.save(notif);

            // Envoi temps réel via WebSocket
            messagingTemplate.convertAndSendToUser(
                    agent.getEmail(),
                    "/notifications",
                    notif
            );
        }
    }

    public void notifyUserOnResolution(Reclamation reclamation, User agentOuAdmin) {
        User client = reclamation.getUser(); // ✅ tu utilises le champ existant

        if (client == null) {
            log.warn("Réclamation sans utilisateur créateur (user), pas de notification envoyée.");
            return;
        }

        String nomAgent = agentOuAdmin != null ? agentOuAdmin.getFullName() : "un agent";

        String message = "Votre réclamation " + reclamation.getIdReclamation() + " a été résolue par " + nomAgent + ".";

        Notification notif = Notification.builder()
                .message(message)
                .date(LocalDateTime.now())
                .status(NotificationStatus.NON_LUE)
                .vue(false)
                .destinataire(client) // 👈 ici c’est toujours `destinataire` dans Notification
                .actionPar(agentOuAdmin)
                .reclamationId(reclamation.getIdReclamation())
                .build();

        notificationRepository.save(notif);

        messagingTemplate.convertAndSendToUser(
                client.getEmail(),
                "/notifications",
                notif
        );
    }


}
