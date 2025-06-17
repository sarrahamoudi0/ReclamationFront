package com.example.reclamation.security;

import com.example.reclamation.user.User;
import com.example.reclamation.user.UserRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service

public class UserDetailsServiceImpl implements UserDetailsService {
        private final UserRepository repository;
        @Override
        @Transactional
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                User user = repository.findByEmail(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                if (user.isBanned()) {
                        throw new DisabledException("Ce compte est banni.");
                }

                return user;
        }

}
