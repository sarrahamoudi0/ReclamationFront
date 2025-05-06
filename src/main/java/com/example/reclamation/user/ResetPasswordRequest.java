package com.example.reclamation.user;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotEmpty(message = "Le mot de passe ne peut pas être vide")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String newPassword;

    @NotEmpty(message = "La confirmation du mot de passe ne peut pas être vide")
    private String confirmPassword;

    @NotEmpty(message = "Le token est requis")
    private String token;

    private String email;  // This might be used in some scenarios, but it's not required in the request body if you're passing the token.

}
