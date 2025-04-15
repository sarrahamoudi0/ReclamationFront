package com.example.reclamation;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class CommentaireImpService implements ICommentaireService {
    @Autowired
    private CommentaireRepository commentaireRepository;

    @Override
    public Commentaire createCommentaire(Commentaire commentaire) {
        return commentaireRepository.save(commentaire);
    }

    @Override
    public List<Commentaire> getAllCommentaires() {

        return commentaireRepository.findAll();
    }

    @Override
    public Commentaire updateCommentaire(Commentaire commentaire){
        return commentaireRepository.save(commentaire);
    }
    @Override
    public void deleteCommentaire(String id) {

        commentaireRepository.deleteById(id);
    }
    @Override
    public Commentaire getCommentaireyId(String id) {

        return commentaireRepository.findById(id).orElse(null);
    }
}
