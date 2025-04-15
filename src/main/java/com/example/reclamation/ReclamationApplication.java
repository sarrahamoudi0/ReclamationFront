package com.example.reclamation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.mail.javamail.JavaMailSender;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
public class ReclamationApplication {
    @Autowired
    MailingService mailingService;
    @Autowired
    private JavaMailSender javaMailSender;

    public static void main(String[] args) {

        ApplicationContext context = SpringApplication.run(ReclamationApplication.class, args);
        ReclamationApplication app = context.getBean(ReclamationApplication.class);


    }
}