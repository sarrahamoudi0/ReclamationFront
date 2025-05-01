package com.example.reclamation.security;

import com.example.reclamation.user.UserRepository;
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
            return repository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        }
}
