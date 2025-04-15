package com.example.reclamation;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@NoArgsConstructor
@AllArgsConstructor
@RequestMapping("/commentaire")
@CrossOrigin("*")
public class CommentaireController {
    @Autowired
    private  ICommentaireService commentaireService;

    @PostMapping("/addCommentaire")
    public Commentaire createCommentaire(@RequestBody Commentaire commentaire) {
        return commentaireService.createCommentaire(commentaire);
    }

    @GetMapping("/getAllCommentaire")
    public List<Commentaire> getAllCommentaire() {

        return commentaireService.getAllCommentaires();
    }

    @PutMapping("/updateCommentaire")
    public Commentaire updateCommentaire(@RequestBody Commentaire commentaire){

        return commentaireService.updateCommentaire(commentaire);
    }
    @DeleteMapping("/remove/{commentaire-id}")
    public void deleteCommentaire(@PathVariable("commentaire-id")String id){

        commentaireService.deleteCommentaire(id);
    }

    @GetMapping("/getCommentaireById/{id}")
    public Commentaire getCommentaireById(@PathVariable String id) {

        return commentaireService.getCommentaireyId(id);
    }
}
