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
}
