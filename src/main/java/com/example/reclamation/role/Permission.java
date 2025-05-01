package com.example.reclamation.role;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum Permission {

    ADMIN_READ("admin:read"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_DELETE("admin:delete"),
    ADMIN_CREATE("admin:create"),

    AGENT_READ("agent:read"),
    AGENT_UPDATE("agent:update"),
    AGENT_DELETE("agent:delete"),
    AGENT_CREATE("agent:create");

    @Getter
    private final String permission;
}

