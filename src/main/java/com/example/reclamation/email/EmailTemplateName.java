package com.example.reclamation.email;

import lombok.Getter;

@Getter
public enum EmailTemplateName {

    ACTIVATE_ACCOUNT("activate_account"),
    RESET_PASSWORD("reset_password"),
    commentaire_notification("commentaire_notification"),
    réunion_notification("réunion_norification"),
    CHANGE_EMAIL("change_email");

    private final String name;

    EmailTemplateName(String name) {
        this.name = name;
    }
}
