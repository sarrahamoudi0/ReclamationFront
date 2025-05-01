package com.example.reclamation;

import com.example.reclamation.role.Role;
import com.example.reclamation.role.RoleRepository;
import com.example.reclamation.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.mail.javamail.JavaMailSender;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
@EnableMongoRepositories(basePackages = "com.example.reclamation")
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


    @Bean
    public CommandLineRunner Runner (RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.findByName("USER").isEmpty()) {
                roleRepository.save(
                        Role.builder().name("USER").build()
                );
            }
        };
    }}


