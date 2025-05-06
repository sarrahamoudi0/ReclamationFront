package com.example.reclamation.token;


import org.springframework.data.mongodb.core.mapping.Document;

import com.example.reclamation.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document
public class Token {

    @Id
    private String id;

    private String token;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime validatedAt;

    private TokenType tokenType = TokenType.BEARER;

    private boolean revoked;

    private boolean expired;

    @DBRef
    private User user;

    // Add a custom constructor for blacklisting a token
    public Token(String token, LocalDateTime createdAt) {
        this.token = token;
        this.createdAt = createdAt;
        this.expiresAt = null;  // You may want to leave expiresAt as null for blacklisted tokens
        this.validatedAt = null; // Set validatedAt to null if you're invalidating the token
        this.revoked = true;    // Mark it as revoked since it is blacklisted
        this.expired = true;    // Mark it as expired if needed
    }
}

