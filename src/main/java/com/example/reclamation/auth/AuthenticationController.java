package com.example.reclamation.auth;



import com.example.reclamation.token.Token;
import com.example.reclamation.token.TokenRepository;
import com.example.reclamation.user.AdminCreateUserRequest;
import com.example.reclamation.user.ResetPasswordRequest;
import com.example.reclamation.user.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        // Strip "Bearer " prefix from the token
        String jwtToken = token.replace("Bearer ", "");

        // Call the logout method from AuthenticationService to blacklist or invalidate the token
        service.logout(jwtToken);

        return ResponseEntity.ok().build(); // Return a success response
    }



    @PostMapping("/create-user")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> createUserByAdmin(@RequestBody AdminCreateUserRequest request) {
        // Call the service layer to create the user
        String responseMessage = service.createUserByAdmin(request);

        // Return success or failure message based on service response
        if ("User created successfully.".equals(responseMessage)) {
            return ResponseEntity.status(HttpStatus.CREATED).body(responseMessage);
        } else {
            return ResponseEntity.badRequest().body(responseMessage); // Error message
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
            boolean updated = service.updateUserRole(id, roleName);
            if (!updated) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok("Role updated successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    // Endpoint to delete a user
    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        String responseMessage = service.deleteUser(id);
        return ResponseEntity.ok(responseMessage);
    }

}






