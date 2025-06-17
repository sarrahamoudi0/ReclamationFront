package com.example.reclamation.email;


import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.HashMap;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.mail.javamail.MimeMessageHelper.MULTIPART_MODE_MIXED;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Async
    public void sendEmail(
            String to,
            String username,
            EmailTemplateName emailTemplate,
            String confirmationUrl,
            String activationCode,
            String subject
    ) throws MessagingException {
        String templateName = emailTemplate != null
                ? emailTemplate.name()
                : "confirm-email";

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                mimeMessage,
                MULTIPART_MODE_MIXED,
                UTF_8.name()
        );

        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("confirmationUrl", confirmationUrl);

        // Ajouter activation_code seulement s'il n'est pas vide
        if (activationCode != null && !activationCode.isEmpty()) {
            properties.put("activation_code", activationCode);
        }

        Context context = new Context();
        context.setVariables(properties);

        helper.setFrom("noreply@maginater.com");
        helper.setTo(to);
        helper.setSubject(subject);

        String htmlContent = templateEngine.process(templateName, context);
        helper.setText(htmlContent, true);

        mailSender.send(mimeMessage);
    }
}
