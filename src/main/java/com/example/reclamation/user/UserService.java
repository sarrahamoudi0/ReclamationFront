package com.example.reclamation.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
}
