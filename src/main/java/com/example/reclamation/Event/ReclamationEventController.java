package com.example.reclamation.Event;

import com.example.reclamation.reclamation.IReclamationService;
import com.example.reclamation.reclamation.Reclamation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@CrossOrigin("*")
@RequiredArgsConstructor

public class ReclamationEventController {
    private final ReclamationEventService eventService;
    private final IReclamationService reclamationService;


    @GetMapping("/by-reclamation/{id}")
    public List<ReclamationEvent> getEvents(@PathVariable String id) {
        Reclamation rec = reclamationService.getReclamationById(id);
        return eventService.getEventsForReclamation(rec);
    }

    @GetMapping("/admin/reclamation-events")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<ReclamationEvent>> getAgentAndAdminEvents() {
        List<ReclamationEvent> events = eventService.getEventsByAgentsAndAdmins();
        return ResponseEntity.ok(events);
    }

}
