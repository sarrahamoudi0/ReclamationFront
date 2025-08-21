package com.example.reclamation.presence;

public enum PresenceStatus {
    PRESENT("Present"),
    ABSENT("Absent"),
    LATE("Late"),
    HALF_DAY("Half Day"),
    LEAVE("Leave");
    
    private final String displayName;
    
    PresenceStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
