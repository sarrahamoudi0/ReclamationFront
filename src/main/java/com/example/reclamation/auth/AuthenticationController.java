package com.example.reclamation.auth;



import com.example.reclamation.token.Token;
import com.example.reclamation.token.TokenRepository;
import com.example.reclamation.user.ResetPasswordRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
@CrossOrigin(origins = "http://localhost:4200") // autorise Angular
public class AuthenticationController {

    private final AuthenticationService service;
    private final TokenRepository tokenRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody @Valid RegistrationRequest request
    ) {
        try {
            service.register(request);
            return ResponseEntity.accepted().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l'envoi de l'email.");
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
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
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            service.sendResetPasswordEmail(email);
            return ResponseEntity.ok("Email de réinitialisation envoyé.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur : " + e.getMessage());
        }
    }
    // In your controller method
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam("token") String token,  // Token from query parameter
            @Valid @RequestBody ResetPasswordRequest request) {

        // Check if the token is provided
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Token is required");
        }

        // Log the token (optional, for debugging purposes)
        System.out.println("Received token: " + token);

        // Add the token to the request body object
        request.setToken(token);

        try {
            // Call your service to handle the password reset
            service.resetPassword(request);
            return ResponseEntity.ok("Mot de passe réinitialisé avec succès");
        } catch (Exception e) {
            // Log the exception (optional, for debugging purposes)
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la réinitialisation du mot de passe");
        }
    }






}






