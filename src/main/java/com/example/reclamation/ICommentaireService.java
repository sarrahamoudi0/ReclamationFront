package com.example.reclamation;

import java.util.List;

public interface ICommentaireService {
    Commentaire createCommentaire(Commentaire commentaire);
    List<Commentaire> getAllCommentaires();

    Commentaire updateCommentaire(Commentaire commentaire);
    void deleteCommentaire(String id);
    Commentaire getCommentaireyId(String id);
}
