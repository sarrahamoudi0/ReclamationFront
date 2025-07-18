package com.example.reclamation.Profile;

import lombok.Data;

@Data

public class ProfileUpdateRequest {
    private String firstname;
    private String lastname;
    private String phone;
    private String email;
    private String currentPassword;


}
