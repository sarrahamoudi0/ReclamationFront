package com.example.reclamation.notification;

import com.example.reclamation.user.User;
import com.example.reclamation.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping("/mynotif")
    public List<Notification> getMyNotifications(@AuthenticationPrincipal User user) {
        return notificationRepository.findByDestinataireOrderByDateDesc(user);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable String id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notif.setVue(true);
        notificationRepository.save(notif);
    }

    @GetMapping("/count-unread")
    public long getUnreadCount(@AuthenticationPrincipal User user) {
        return notificationRepository.countByDestinataireAndVueFalse(user);
    }
}
