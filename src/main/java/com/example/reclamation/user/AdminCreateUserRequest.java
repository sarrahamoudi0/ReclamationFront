package com.example.reclamation.user;

import com.example.reclamation.role.Role;
import lombok.Data;

@Data
public class AdminCreateUserRequest {
    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private String password;
    private Role role;
    private boolean accountLocked;
    private boolean enabled;
}