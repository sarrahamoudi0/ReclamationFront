package com.example.reclamation;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Date;

@AllArgsConstructor
@Service

public class MailingService {
    private final JavaMailSender javaMailSender;
    private final MailRepository mailRepository;

    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("noreply@maginater.com");

        // Create and save email object
        Mail mail = Mail.builder()
                .to(to)
                .subject(subject)
                .body(body)
                .createDate(new Date())
                .build();

        try {
            javaMailSender.send(message);
        } catch (MailException e) {
            System.err.println("Error sending email: " + e.getMessage());
        }

        mailRepository.save(mail);
    }
}
