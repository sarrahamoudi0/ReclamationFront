package com.example.reclamation.user;

import com.example.reclamation.email.EmailService;
import com.example.reclamation.email.EmailTemplateName;
import com.example.reclamation.security.JwtService;
import com.example.reclamation.token.Token;
import com.example.reclamation.token.TokenRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class UserService {


    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final EmailService emailService;
    private final TokenRepository tokenRepository;

    @Value("${application.mailing.frontend.change-email-url}")
    private String changeEmailUrl;

    @Value("${reset.password.url}")
    private String resetPasswordUrl;


    // This method gets the currently authenticated user
    public User getCurrentUser() {
        // Get the current Authentication object
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // If no authentication or the user is anonymous, throw an exception
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }

        // Get the email from authentication (as username is mapped to email)
        String email = authentication.getName();

        // Retrieve the user from the repository using the email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateProfile(String firstname, String lastname, String phone, String email, String currentPassword) {
        User user = getCurrentUser();
        System.out.println("updateProfile called with email = " + email);

        // Vérification du mot de passe actuel
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            System.out.println("Mot de passe incorrect");
            throw new RuntimeException("Mot de passe actuel incorrect");
        }

        if (!user.getEmail().equals(email)) {
            System.out.println("Email modifié : ancien = " + user.getEmail() + ", nouveau = " + email);

            if (userRepository.existsByEmail(email)) {
                System.out.println("Email déjà utilisé");
                throw new RuntimeException("Email déjà utilisé");
            }

            user.setPendingEmail(email);
            System.out.println("Appel de sendValidationEmailToNewAddress");
            sendValidationEmailToNewAddress(user);
        }

        user.setFirstname(firstname);
        user.setLastname(lastname);
        user.setPhone(phone);

        User savedUser = userRepository.save(user);
        System.out.println("User saved with id = " + savedUser.getId());

        return savedUser;
    }

    private void sendValidationEmailToNewAddress(User user) {
        System.out.println("Début envoi email pour : " + user.getPendingEmail());
        String token = generateAndSaveActivationToken(user);
        System.out.println("Token généré : " + token);
        try {
            emailService.sendEmail(
                    user.getPendingEmail(),
                    user.getFullName(),
                    EmailTemplateName.CHANGE_EMAIL,
                    changeEmailUrl,
                    token,
                    "Confirmation de changement d'email"
            );
            System.out.println("Email envoyé avec succès");
        } catch (MessagingException e) {
            System.err.println("Erreur lors de l'envoi de l'email : " + e.getMessage());
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }



    public User confirmEmailChange(String tokenString) {
        Token token = tokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        if (token.isRevoked() || token.isExpired() || token.getValidatedAt() != null) {
            throw new RuntimeException("Token invalide ou déjà utilisé");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expiré");
        }

        User user = token.getUser();

        if (user.getPendingEmail() == null) {
            throw new RuntimeException("Aucun email en attente de validation");
        }

        user.setEmail(user.getPendingEmail());
        user.setPendingEmail(null);

        userRepository.save(user);

        token.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(token);

        return user; // retourner user mis à jour
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode(6);

        var token = Token.builder()
                .token(generatedToken)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();

        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateActivationCode(int length) {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();

        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }

        return codeBuilder.toString();
    }

    public void sendValidationEmailToNewAddress(User user, String newEmail) {
        if (userRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email déjà utilisé");
        }
        user.setPendingEmail(newEmail);
        userRepository.save(user); // enregistrer le changement pendingEmail

        String token = generateAndSaveActivationToken(user);
        try {
            emailService.sendEmail(
                    newEmail,
                    user.getFullName(),
                    EmailTemplateName.CHANGE_EMAIL,
                    changeEmailUrl,
                    token,
                    "Confirmation de changement d'email"
            );
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }



}
