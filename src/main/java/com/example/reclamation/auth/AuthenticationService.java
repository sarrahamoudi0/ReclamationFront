package com.example.reclamation.auth;



import com.example.reclamation.email.EmailService;
import com.example.reclamation.email.EmailTemplateName;
import com.example.reclamation.role.Role;
import com.example.reclamation.security.JwtService;
import com.example.reclamation.token.Token;
import com.example.reclamation.token.TokenRepository;
import com.example.reclamation.user.AdminCreateUserRequest;
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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
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

        var userRole = Role.ROLE_USER; // Enum
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .phone(request.getPhone())

                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .accountLocked(false)
                .enabled(false)
                .role(userRole)
                .build();

        userRepository.save(user);
        sendValidationEmail(user);
    }




    public String createUserByAdmin(AdminCreateUserRequest request) {
        // Validate the role is not null
        if (request.getRole() == null) {
            return "Role is required.";
        }

        // Ensure the role is valid
        Role role;
        try {
            role = Role.valueOf(request.getRole().name());  // Ensures role is a valid enum
        } catch (IllegalArgumentException e) {
            return "Invalid role.";
        }

        // Encrypt the password
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Create new User object with the provided details and role
        User newUser = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(encodedPassword)
                .role(role)  // Set role to the user
                .enabled(true)  // Enable the user by default
                .accountLocked(false)  // Account is not locked initially
                .build();

        // Save the new user to the database
        userRepository.save(newUser);

        // Return success message
        return "User created successfully.";
    }

    public String updateUser(String id, AdminCreateUserRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        // Update fields
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());

        userRepository.save(user);

        return "User updated successfully.";
    }

    public String deleteUser(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);

        return "User deleted successfully.";
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
        // 1) Lookup user by email
        var user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        // 2) Generate a JWT token for password reset
        String token = jwtService.generateTokenForEmail(email);

        // 3) Build the FRONTEND reset link with the JWT token as a query parameter
        String link = UriComponentsBuilder
                .fromHttpUrl(resetPasswordUrl)  // Base URL for password reset page
                .queryParam("token", token)     // Add the token to the query string
                .build()
                .toUriString();

        // 4) Send the reset password email using the email service
        emailService.sendEmail(
                user.getEmail(),                        // To email address
                user.getFullName(),                     // User's full name for personalization
                EmailTemplateName.RESET_PASSWORD,       // Email template for reset password
                link,                                   // The full reset link with the token
                token,                                  // The token itself (raw token for debugging)
                "Réinitialisation du mot de passe"      // Subject of the email
        );
    }







    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String token = request.getToken();

        // Validate and extract the email from the JWT token
        String email;
        try {
            email = jwtService.extractEmailFromToken(token); // Extract email from the token
        } catch (Exception e) {
            throw new RuntimeException("Token invalide ou expiré.");  // Handle invalid or expired token
        }

        // Ensure the new password and confirmation password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas.");
        }

        // Retrieve the user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé."));

        // Update the user's password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);  // Save the updated user

        // Optionally, invalidate the token after use (you can implement this if needed)
        // tokenRepository.deleteByToken(token);   // Delete the used token from the database, if applicable
    }




    public void logout(String token) {
        // Create a blacklisted token using the builder
        Token blacklistedToken = Token.builder()
                .token(token)
                .createdAt(LocalDateTime.now())
                .revoked(true)    // Mark it as revoked
                .expired(true)    // Mark it as expired
                .build();

        tokenRepository.save(blacklistedToken);
    }


    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

}


