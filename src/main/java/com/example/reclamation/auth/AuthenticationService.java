package com.example.reclamation.auth;



import com.example.reclamation.email.EmailService;
import com.example.reclamation.email.EmailTemplateName;
import com.example.reclamation.role.RoleRepository;
import com.example.reclamation.security.JwtService;
import com.example.reclamation.token.Token;
import com.example.reclamation.token.TokenRepository;
import com.example.reclamation.user.ResetPasswordRequest;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;
    private final EmailService emailService;
    private final TokenRepository tokenRepository;

    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;
    @Value("${reset.password.url}")
    private String resetPasswordUrl;


    public void register(RegistrationRequest request) throws MessagingException {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cette adresse email existe déjà !");
        }

        var userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new IllegalStateException("ROLE USER was not initiated"));

        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .accountLocked(false)
                .enabled(false)
                .roles(List.of(userRole.getName()))
                .build();

        userRepository.save(user);
        sendValidationEmail(user);
    }


    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var claims = new HashMap<String, Object>();
        var user = ((User) auth.getPrincipal());
        claims.put("fullName", user.getFullName());

        var jwtToken = jwtService.generateToken(claims, user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    @Transactional
    public void activateAccount(String token) throws MessagingException {
        Token savedToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        // Logge l'état du token pour déboguer
        System.out.println("Token reçu : " + token);
        System.out.println("Token trouvé : " + savedToken);

        if (LocalDateTime.now().isAfter(savedToken.getExpiresAt())) {
            sendValidationEmail(savedToken.getUser());
            throw new RuntimeException("Activation token has expired.");
        }

        if (savedToken.getValidatedAt() != null) {
            throw new RuntimeException("Token has already been validated.");
        }

        var user = userRepository.findById(savedToken.getUser().getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);

        savedToken.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(savedToken);
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

    private void sendValidationEmail(User user) throws MessagingException {
        var newToken = generateAndSaveActivationToken(user);

        emailService.sendEmail(
                user.getEmail(),
                user.getFullName(),
                EmailTemplateName.ACTIVATE_ACCOUNT,
                activationUrl,
                newToken,
                "Account activation"
        );
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




    public void sendResetPasswordEmail(String email) throws MessagingException {
        // 1) Lookup user
        var user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        // 2) Generate & persist a one-time reset token
        String token = generateActivationCode(6);
        var resetToken = Token.builder()
                .token(token)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();
        tokenRepository.save(resetToken);

        // 3) Build the FRONTEND reset link with ?token=<token>
        //    e.g. http://localhost:4200/reset-password?token=ABC123
        String link = UriComponentsBuilder
                .fromHttpUrl(resetPasswordUrl)      // → http://localhost:4200/reset-password
                .queryParam("token", token)         // → ?token=713658
                .build()
                .toUriString();


        // 4) Send the email using the existing generic sendEmail(...) method:
        emailService.sendEmail(
                user.getEmail(),                               // to
                user.getFullName(),                            // username (for personalization)
                EmailTemplateName.RESET_PASSWORD,              // which template to use
                link,                                          // confirmationUrl → the full link
                token,                                         // activationCode (i.e. the raw token)
                "Réinitialisation du mot de passe"             // email subject
        );
    }






    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Récupérer le token de la requête
        Token token = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        if (LocalDateTime.now().isAfter(token.getExpiresAt())) {
            throw new RuntimeException("Le token a expiré.");
        }

        // Récupérer l'utilisateur lié au token
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Marquer le token comme validé
        token.setValidatedAt(LocalDateTime.now());
        tokenRepository.save(token);
    }





}


