package com.example.reclamation.categorie;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@NoArgsConstructor
@AllArgsConstructor
@RequestMapping("/categorie")
@CrossOrigin("*")
public class categorieController {
    @Autowired
    private ICategorieService categorieService;

    @PostMapping("/addCategorie")
    public ResponseEntity<Categorie> createCategorie(@RequestBody Categorie categorie) {
        Categorie createdCategorie = categorieService.createCategorie(categorie);
        return ResponseEntity.ok(createdCategorie);  // Return created category with HTTP 200 status
    }

    @GetMapping("/getAllCategorie")
    public ResponseEntity<List<Categorie>> getAllCategories() {
        List<Categorie> categories = categorieService.getAllCategories();
        return ResponseEntity.ok(categories);  // Return all categories with HTTP 200 status
    }

    @PutMapping("/updateCategorie")
    public ResponseEntity<Categorie> updateCategorie(@RequestBody Categorie categorie) {
        Categorie updatedCategorie = categorieService.updateCategorie(categorie);
        return ResponseEntity.ok(updatedCategorie);  // Return updated category with HTTP 200 status
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable("id") String id) {
        categorieService.deleteCategorie(id);
        return ResponseEntity.noContent().build();  // Return HTTP 204 for successful deletion
    }

    @PostMapping("/{id}/sous-categorie")
    public ResponseEntity<Categorie> addSubcategory(
            @PathVariable String id,
            @RequestBody NomSousCategorieDTO dto) {
        Categorie updatedCategorie = categorieService.addSubcategory(id, dto.getNomSousCategorie());
        return ResponseEntity.ok(updatedCategorie);  // Return the updated category with HTTP 200 status
    }

    @GetMapping("/{id}/sous-categories")
    public ResponseEntity<List<SousCategorie>> getSubcategories(
            @PathVariable("id") String id) {
        Categorie parent = categorieService.getCategorieById(id);
        if (parent == null || parent.getSousCategories() == null) {
            return ResponseEntity.notFound().build();  // Return HTTP 404 if the category or subcategories are not found
        }
        List<SousCategorie> subcategories = parent.getSousCategories();
        return ResponseEntity.ok(subcategories);  // Return the subcategories with HTTP 200 status
    }

    @GetMapping("/getAllCategoriesWithSubcategories")
    public ResponseEntity<List<Categorie>> getAllCategoriesWithSubcategories() {
        List<Categorie> categoriesWithSubcategories = categorieService.getAllCategoriesWithSubcategories();
        return ResponseEntity.ok(categoriesWithSubcategories);  // Return categories with subcategories with HTTP 200 status
    }

    @DeleteMapping("/{idParent}/sous-categorie/{idSousCategorie}")
    public ResponseEntity<Categorie> removeSubcategory(
            @PathVariable String idParent,
            @PathVariable String idSousCategorie) {
        try {
            Categorie updatedParent = categorieService.removeSubcategory(idParent, idSousCategorie);
            return ResponseEntity.ok(updatedParent);  // Return updated parent with HTTP 200 status
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();  // Return HTTP 404 if subcategory not found
        }
    }
}