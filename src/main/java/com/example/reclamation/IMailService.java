package com.example.reclamation;

import org.springframework.http.ResponseEntity;

public interface IMailService {
    public ResponseEntity<String> mailsended(String to, String subject,String body);
}
