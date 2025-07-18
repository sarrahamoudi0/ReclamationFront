import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../service/authentication.service';
import { ProfileUpdateRequest } from '../models/ProfileUpdateRequest';
import { User } from '../models/User';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-profileupdate',
  templateUrl: './profileupdate.component.html',
  styleUrls: ['./profileupdate.component.css']
})
export class ProfileupdateComponent implements OnInit {
  profileForm!: FormGroup;
  activationForm!: FormGroup; // formulaire du popup
  errorMessage = '';
  successMessage = '';
  originalEmail = '';
  showActivationModal = false; // contrôle du popup
  emailChanged = false;

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private toastr: ToastrService,private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      phone: [''],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required]
    });
    this.activationForm = this.fb.group({
      activationCode: ['', Validators.required]
    });
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authenticationService.getCurrentUser().subscribe(user => {
      this.originalEmail = user.email;
      this.profileForm.patchValue({
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
        email: user.email
      });
    }, error => {
      this.errorMessage = 'Erreur lors du chargement du profil.';
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.profileForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
      return;
    }

    this.emailChanged = this.profileForm.value.email !== this.originalEmail;

    if (this.emailChanged) {
      this.authenticationService.requestEmailConfirmation(this.profileForm.value.email).subscribe({
        next: () => {
          console.log('Réponse OK, ouverture du popup');
          this.toastr.info('Email de confirmation envoyé. Veuillez vérifier votre boîte mail.');
          this.showActivationModal = true;
          this.cdRef.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors de l\'envoi de l\'email de confirmation.';
          console.error('Erreur lors de l\'envoi de l\'email de confirmation:', err);
        }
      });
    } else {
      this.updateProfile();
    }
  }


  updateProfile() {
    this.authenticationService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        
        this.toastr.success(this.successMessage, 'Succès');
        this.showActivationModal = false;
        this.originalEmail = this.profileForm.value.email; // Mise à jour ici, après succès
        this.emailChanged = false; // reset variable
      },
      error: (error) => {
        this.errorMessage = error.error || 'Une erreur est survenue.';
      }
    });
  }

  confirmEmailChange() {
    if (this.activationForm.invalid) {
      this.errorMessage = 'Veuillez entrer le code de confirmation.';
      return;
    }

    const token = this.activationForm.value.activationCode;

    this.authenticationService.confirmEmailChange(token).subscribe({
      next: (response: any) => {
        // Récupère le nouveau token du backend
        if (response && response.token) {
          this.authenticationService.storeToken(response.token);
          this.toastr.success('Email confirmé et session actualisée !');
          this.successMessage = response.message || 'Email confirmé avec succès !';
          this.activationForm.reset();
          this.showActivationModal = false;
          // Recharge le profil utilisateur pour afficher le nouvel email
          this.loadUserProfile();
        } else {
          this.toastr.success('Email confirmé, veuillez vous reconnecter.');
          this.authenticationService.logout();
        }
      },
      error: (err) => {
        this.errorMessage = err.error || 'Code de confirmation invalide.';
      }
    });
  }
  

  cancelActivation() {
    this.showActivationModal = false;
    this.errorMessage = '';
    this.activationForm.reset();
  }
}
