package com.example.reclamation;

import jakarta.mail.MessagingException;

import java.util.List;

public interface ICommentaireService {

    Commentaire updateCommentaire(Commentaire commentaire);
    void deleteCommentaire(String id);
    Commentaire getCommentaireyId(String id);
    List<Commentaire> getCommentairesByReclamation(String idReclamation);
    public Commentaire addComment(String idReclamation, String contenu)throws MessagingException;
    List<Commentaire> getCommentairesInternes(String idReclamation);
    public Commentaire addCommentInterne(String idReclamation, String contenu) throws MessagingException;


}
