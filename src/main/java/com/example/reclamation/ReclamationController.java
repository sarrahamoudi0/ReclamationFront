package com.example.reclamation;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@RestController
@NoArgsConstructor
@AllArgsConstructor
@RequestMapping("/project")
@CrossOrigin("*")
public class ReclamationController {
    @Autowired
    private  IReclamationService reclamationService;


    @PostMapping("/addReclamation")
    public ResponseEntity<Reclamation> createReclamation(
            @RequestParam("nom") String nom,
            @RequestParam("prenom") String prenom,
            @RequestParam("email") String email,
            @RequestParam("num") String num,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam(value = "image_reclamation", required = false) MultipartFile fileReclamation) throws IOException {

        // Création de l'objet Reclamation
        Reclamation reclamation = new Reclamation();
        reclamation.setNom(nom);
        reclamation.setPrenom(prenom);
        reclamation.setNum(num);
        reclamation.setEmail(email);
        reclamation.setTitre(titre);
        reclamation.setDescription(description);

        // Vérification si un fichier a été téléchargé
        if (fileReclamation != null && !fileReclamation.isEmpty()) {
            // Si un fichier est présent, on convertit en tableau de bytes
            reclamation.setImage_reclamation(fileReclamation.getBytes());
        } else {
            // Si aucun fichier n'est fourni, on garde le champ image_reclamation nul
            reclamation.setImage_reclamation(null);
        }

        // Sauvegarde de la réclamation dans la base de données
        Reclamation savedReclamation = reclamationService.createReclamation(reclamation);

        // Retour de la réclamation sauvegardée avec un code de statut HTTP 200
        return ResponseEntity.ok(savedReclamation);
    }



    @GetMapping("/getAllReclamation")
    public List<Reclamation> getAllReclamation() {

        return reclamationService.getAllReclamations();
    }

    @PutMapping("/updateReclamation")
    public Reclamation updateReclamation(@RequestBody Reclamation reclamation){

        return reclamationService.updateReclamation(reclamation);
    }
    @DeleteMapping("/remove/{reclamation-id}")
    public void deleteReclamation(@PathVariable("reclamation-id")String id){

        reclamationService.deleteReclamation(id);
    }

    @GetMapping("/getReclamationById/{id}")
    public Reclamation getReclamationById(@PathVariable String id) {

        return reclamationService.getReclamationById(id);
    }

}
