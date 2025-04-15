  import { Component, OnInit } from '@angular/core';
import { Reclamation } from '../models/Reclamation';
import { ReclamationService } from '../service/reclamation.service';
import { ActivatedRoute } from '@angular/router';
import { Statut } from '../models/Statut';

@Component({    
  selector: 'app-show-reclamation',
  templateUrl: './show-reclamation.component.html',
  styleUrls: ['./show-reclamation.component.css']
})
export class ShowReclamationComponent implements OnInit{

  reclamation!: Reclamation;

  constructor(private reclamationService: ReclamationService, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idReclamation = params.get('id'); 
  
      if (idReclamation) {
        this.getReclamation(idReclamation); 
      } else {
        console.error('ID de réclamation invalide :', idReclamation);
      }
    });
  }

  getReclamation(idReclamation: string): void {
    this.reclamationService.getReclamationById(idReclamation).subscribe(
      (reclamation: Reclamation) => {
        this.reclamation = reclamation;
      },
      (error) => {
        console.error('Error fetching forum:', error);
        
      }
    );
  }

  getStatutClass(statut: Statut): string {
    switch (statut) {
      case Statut.Nouveau:
        return 'statut-nouveau'; // Green for 'Nouveau'
      case Statut.Encours:
        return 'statut-en-cours'; // Orange for 'Encours'
      case Statut.Escale:
        return 'statut-escalé'; // Blue for 'Escale'
      case Statut.Résolu:
        return 'statut-resolu'; // Green for 'Résolu'
      default:
        return ''; // Default case for invalid or empty statut
    }
  }
  
  }
  

  

