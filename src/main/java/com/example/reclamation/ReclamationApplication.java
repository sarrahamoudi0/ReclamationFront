package com.example.reclamation;

import com.example.reclamation.mailling.MailingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.mail.javamail.JavaMailSender;

@EnableMongoRepositories(basePackages = "com.example.reclamation")
@SpringBootApplication
public class ReclamationApplication {
    MailingService mailingService;
    @Autowired
    private JavaMailSender javaMailSender;

    public static void main(String[] args) {

        ApplicationContext context = SpringApplication.run(ReclamationApplication.class, args);
        ReclamationApplication app = context.getBean(ReclamationApplication.class);


    }


}


