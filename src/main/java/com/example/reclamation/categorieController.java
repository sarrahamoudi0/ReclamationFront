package com.example.reclamation;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@NoArgsConstructor
@AllArgsConstructor
@RequestMapping("/categorie")
@CrossOrigin("*")
public class categorieController {
    @Autowired
    private  ICategorieService categorieService;

    @PostMapping("/addCategorie")
    public Categorie createCategorie(@RequestBody Categorie categorie) {
        return categorieService.createCategorie(categorie);

    }

    @GetMapping("/getAllCategorie")
    public List<Categorie> getAllCategories() {

        return categorieService.getAllCategories();
    }

    @PutMapping("/updateCategorie")
    public Categorie updateCategorie(@RequestBody Categorie categorie){

        return categorieService.updateCategorie(categorie);
    }
    @DeleteMapping("/remove/{categorie-id}")
    public void deleteCategorie(@PathVariable("categorie-id")String id){

        categorieService.deleteCategorie(id);
    }

    @PostMapping("{id}/sous-categorie")
    public ResponseEntity<Categorie> ajouterSousCategorie(
            @PathVariable String id,
            @RequestBody NomSousCategorieDTO dto) {
        return ResponseEntity.ok(
                categorieService.ajouterSousCategorie(id, dto.getNomSousCategorie())
        );
    }


    @GetMapping("/{id}/sous-categories")
    public ResponseEntity<List<Categorie>> getSousCategories(
            @PathVariable("id") String id) {
        Categorie parent = categorieService.getCategorieById(id);
        if (parent == null) {
            return ResponseEntity.notFound().build();
        }
        List<Categorie> subs = parent.getSousCategories();
        return ResponseEntity.ok(subs != null ? subs : Collections.emptyList());
    }

    @GetMapping("/getAllCategoriesWithSubcategories")
    public List<Categorie> getAllCategoriesWithSubcategories() {
        // Fetch and return all categories with their subcategories
        return categorieService.getAllCategoriesWithSubcategories();
    }

    @DeleteMapping("/{idParent}/sous-categorie/{idSousCategorie}")
    public ResponseEntity<Categorie> supprimerSousCategorie(
            @PathVariable String idParent,
            @PathVariable String idSousCategorie) {
        try {
            Categorie updatedParent = categorieService.supprimerSousCategorie(idParent, idSousCategorie);
            return ResponseEntity.ok(updatedParent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


}




