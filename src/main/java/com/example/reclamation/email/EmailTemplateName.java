package com.example.reclamation.email;

import lombok.Getter;

@Getter
public enum EmailTemplateName {

    ACTIVATE_ACCOUNT("activate_account"),
    RESET_PASSWORD("reset_password"),
    commentaire_notification("commentaire_notification");

    private final String name;

    EmailTemplateName(String name) {
        this.name = name;
    }
}
