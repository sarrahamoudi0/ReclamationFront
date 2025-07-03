package com.example.reclamation.auth;



import com.example.reclamation.logs.AuditLogService;
import com.example.reclamation.role.Role;
import com.example.reclamation.token.Token;
import com.example.reclamation.token.TokenRepository;
import com.example.reclamation.user.AdminCreateUserRequest;
import com.example.reclamation.user.ResetPasswordRequest;
import com.example.reclamation.user.User;
import com.example.reclamation.user.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
@CrossOrigin(origins = "http://localhost:4200") // autorise Angular
public class AuthenticationController {

    private final AuthenticationService service;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);


    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(
            @RequestPart("user") @Valid RegistrationRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        System.out.println("Received user: " + request);
        System.out.println("Received image: " + (image != null ? image.getOriginalFilename() : "No image"));
        try {
            service.register(request, image);
            return ResponseEntity.accepted().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'envoi de l'email.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors du traitement de l'image.");
        }
    }


    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = service.authenticate(request);

            User user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole() == Role.ROLE_AGENT || user.getRole() == Role.ROLE_ADMIN) {
                auditLogService.logAction(
                        user.getEmail(),
                        "Connexion",
                        user.getRole() == Role.ROLE_AGENT
                                ? "Agent connecté avec succès"
                                : "Administrateur connecté avec succès"
                );
            }


            logger.info("✅ Connexion réussie : email={}, date={}", request.getEmail(), LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            logger.warn("❌ Échec de connexion : email={}, raison={}, date={}",
                    request.getEmail(), e.getMessage(), LocalDateTime.now());

            // Return 401 with a JSON body
            Map<String, String> error = new HashMap<>();
            error.put("message", "Échec de l'authentification : " + e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(error);
        }
    }

    @GetMapping("/activate-account")
    public ResponseEntity<?> confirm(@RequestParam String token) {
        try {
            service.activateAccount(token);
            return ResponseEntity.ok("Compte activé avec succès.");
        } catch (RuntimeException | MessagingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        try {
            service.sendResetPasswordEmail(email);  // Send the reset email
            return ResponseEntity.ok("Email de réinitialisation envoyé.");
        } catch (MessagingException e) {
            // Handle email sending failure
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur d'envoi de l'email : " + e.getMessage());
        } catch (Exception e) {
            // Handle other errors (e.g., user not found)
            return ResponseEntity.badRequest().body("Erreur : " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam("token") String token,  // Token from query parameter
            @RequestBody @Valid ResetPasswordRequest request) {

        // Check if the token is provided
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Token is required");
        }

        // Add the token to the request body object
        request.setToken(token);

        try {
            // Call your service to handle the password reset
            service.resetPassword(request);
            return ResponseEntity.ok("Password successfully reset");
        } catch (Exception e) {
            // Handle exception and send response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error resetting password: " + e.getMessage());
        }
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }
        String token = authHeader.substring(7);

        try {
            User user = service.getUserFromToken(token);
            service.logout(token);  // ta logique pour blacklist

            if (user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_AGENT) {
                String details;
                if (user.getRole() == Role.ROLE_ADMIN) {
                    details = "Administrateur " + user.getFullName() + " déconnecté avec succès";
                } else {
                    details = "Agent " + user.getFullName() + " déconnecté avec succès";
                }
                auditLogService.logAction(user.getEmail(), "Déconnexion", details);
            }

            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }







    @PostMapping("/create-user")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> createUserByAdmin(@RequestBody AdminCreateUserRequest request) {
        String responseMessage = service.createUserByAdmin(request);

        if ("User created successfully.".equals(responseMessage)) {
            String adminEmail = getLoggedAdminEmail();

            auditLogService.logAction(
                    adminEmail,
                    "Création utilisateur",
                    "Administrateur a créé un utilisateur avec email : " + request.getEmail() +
                            " et rôle : " + request.getRole()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
        } else {
            return ResponseEntity.badRequest().body(responseMessage);
        }
    }

    @PutMapping("/ban-user/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
        public ResponseEntity<String> toggleUserBan(@PathVariable String userId) {
        boolean success = service.toggleUserBan(userId);
        if (success) {
            // Récupérer email admin connecté
            String adminEmail = getLoggedAdminEmail();

            // Récupérer l'utilisateur banni
            Optional<User> bannedUserOpt = service.findById(userId);
            if (bannedUserOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable.");
            }
            User bannedUser = bannedUserOpt.get();

            // Statut ban actuel
            boolean isBanned = bannedUser.isBanned();
            String statut = isBanned ? "Banni" : "Débanni";

            // Log d’audit avec statut
            auditLogService.logAction(
                    adminEmail,
                    "Ban/Déban utilisateur",
                    "Admin a changé le statut de ban de l’utilisateur avec email : "
                            + bannedUser.getEmail() + ". Statut actuel : " + statut
            );

            return ResponseEntity.ok("User ban status toggled successfully. Statut: " + statut);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
    }





    @GetMapping("users")
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }

    @PutMapping("/update-user/{id}")
    public ResponseEntity<Map<String, String>> updateUser(@PathVariable String id, @RequestBody AdminCreateUserRequest request) {
        String responseMessage = service.updateUser(id, request);  // Update user logic
        Map<String, String> response = new HashMap<>();
        response.put("message", responseMessage); // Add message to map
        return ResponseEntity.ok(response);  // Return the message as part of a JSON object
    }

    @PutMapping("/update-user-role/{id}")
    public ResponseEntity<String> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        String roleName = body.get("role");
        if (roleName == null) {
            return ResponseEntity.badRequest().body("Role must be provided");
        }

        try {
            // Step 1: Get current admin's email
            String adminEmail = getLoggedAdminEmail();

            // Step 2: Get user before update
            Optional<User> userOptional = service.findById(id);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable.");
            }
            User user = userOptional.get();
            String oldRole = user.getRole().name();

            // Step 3: Update the role
            boolean updated = service.updateUserRole(id, roleName);
            if (!updated) {
                return ResponseEntity.notFound().build();
            }
            User adminUser = userService.findByEmail(adminEmail).orElse(null);
            if (adminUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin non authentifié");
            }
            String oldRoleFormatted = formatRole(oldRole);
            String newRoleFormatted = formatRole(roleName);
            // Step 4: Log the action
            String message = String.format("L'administrateur %s a changé le rôle de l'utilisateur %s de %s à %s.",
                    adminUser.getFullName()  , user.getEmail(), oldRoleFormatted,
                    newRoleFormatted);

            auditLogService.logAction(adminEmail, "Changement de rôle", message);

            return ResponseEntity.ok("Role updated successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String formatRole(String role) {
        if (role == null) return "";
        // Supprime "ROLE_" et met en majuscule la partie restante
        return role.replace("ROLE_", "").toUpperCase();
    }




    // Endpoint to delete a user
    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        String responseMessage = service.deleteUser(id);
        return ResponseEntity.ok(responseMessage);
    }


    private String getLoggedAdminEmail() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        return null;
    }

    private User getLoggedAdminUser() {
        String email = getLoggedAdminEmail();
        if (email == null) return null;
        return userService.findByEmail(email).orElse(null);
    }


}






