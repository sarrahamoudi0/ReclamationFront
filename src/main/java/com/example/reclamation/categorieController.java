package com.example.reclamation;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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



}
