import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../service/reclamation.service';
import { Reclamation } from '../models/Reclamation';
import { Statut } from '../models/Statut'; 
import { Router } from '@angular/router'; 


@Component({
  selector: 'app-my-reclamation',
  templateUrl: './my-reclamation.component.html',
  styleUrls: ['./my-reclamation.component.css']
})
export class MyReclamationComponent    {

  reclamations: Reclamation[] = [];


  constructor(private reclamationService: ReclamationService) {}

  ngOnInit(): void {
    this.fetchReclamations();
  }

  fetchReclamations(): void {
    this.reclamationService.getMyReclamation().subscribe(
      (reclamations: Reclamation[]) => {
      
        this.reclamations = reclamations;
  
        console.log('Fetched Reclamations:', this.reclamations);
      },
      (error) => {
        console.error('Error fetching reclamations:', error);
      }
    );
  }
  
  

  
  getImageUrl(image: File | null): string {
    if (!image) {
      return '';
    }
    return URL.createObjectURL(image);
  }



getFormattedDate(date: Date | null | undefined): string {
  if (!date) {
    return 'No date available'; 
  }
  return new Date(date).toLocaleDateString();
}


  getStatutClass(statut: Statut): string {
    switch (statut) {
      case Statut.Nouveau:
        return 'statut-nouveau';
      case Statut.Encours:
        return 'statut-en-cours';
      case Statut.Escale:
        return 'statut-escalé';
      case Statut.Résolu:
        return 'statut-resolu';
      default:
        return '';
    }
  }

 
}
