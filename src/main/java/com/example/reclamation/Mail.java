package com.example.reclamation;

import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Getter
@Setter
@Data
@Document(collection = "Mail")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mail {
    @Id
    private String idEmail;
    private String to;
    private String subject;
    private String body;
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date createDate;

}
