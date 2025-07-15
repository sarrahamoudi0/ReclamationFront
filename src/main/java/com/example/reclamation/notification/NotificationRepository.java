package com.example.reclamation.notification;

import com.example.reclamation.user.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository  extends MongoRepository<Notification, String> {
    List<Notification> findByDestinataireOrderByDateDesc(User destinataire);
    long countByDestinataireAndVueFalse(User user);


}
