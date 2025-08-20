import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReunionService, CreateReunionRequest, UpdateReunionRequest, ReunionResponse, ReunionType, UserInfo } from '../../service/reunion.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reunion-form',
  templateUrl: './reunion-form.component.html',
  styleUrls: ['./reunion-form.component.css']
})
export class ReunionFormComponent implements OnInit, OnDestroy {
  reunionForm: FormGroup;
  isEditMode = false;
  reunionId: string | null = null;
  loading = false;
  availableAgents: UserInfo[] = [];
  selectedParticipants: UserInfo[] = [];
  
  // Enums for template
  reunionTypes = Object.values(ReunionType);
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reunionService: ReunionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.reunionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadAvailableAgents();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      lieu: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      type: [ReunionType.REUNION_TRAVAIL, [Validators.required]],
      participantIds: [[], [Validators.required, Validators.minLength(1)]],
      ordreDuJour: [''],
      notes: ['']
    });
  }

  private checkEditMode(): void {
    this.reunionId = this.route.snapshot.paramMap.get('id');
    if (this.reunionId) {
      this.isEditMode = true;
      this.loadReunionForEdit();
    }
  }

  private loadReunionForEdit(): void {
    if (!this.reunionId) return;
    
    this.loading = true;
    this.reunionService.getReunionById(this.reunionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reunion) => {
          this.populateForm(reunion);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de la réunion:', error);
          this.toastr.error('Erreur lors du chargement de la réunion');
          this.loading = false;
        }
      });
  }

  private populateForm(reunion: ReunionResponse): void {
    this.reunionForm.patchValue({
      titre: reunion.titre,
      description: reunion.description,
      lieu: reunion.lieu,
      dateDebut: this.formatDateForInput(reunion.dateDebut),
      dateFin: this.formatDateForInput(reunion.dateFin),
      type: reunion.type,
      participantIds: reunion.participants.map(p => p.id),
      ordreDuJour: reunion.ordreDuJour || '',
      notes: reunion.notes || ''
    });
    
    this.selectedParticipants = reunion.participants;
  }

  private loadAvailableAgents(): void {
    this.reunionService.getAvailableAgents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (agents) => {
          this.availableAgents = agents;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des agents:', error);
          this.toastr.error('Erreur lors du chargement des agents');
        }
      });
  }

  onSubmit(): void {
    if (this.reunionForm.valid) {
      this.loading = true;
      
      if (this.isEditMode) {
        this.updateReunion();
      } else {
        this.createReunion();
      }
    } else {
      this.markFormGroupTouched();
      this.toastr.error('Veuillez corriger les erreurs dans le formulaire');
    }
  }

  private createReunion(): void {
    const request: CreateReunionRequest = this.reunionForm.value;
    
    this.reunionService.createReunion(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reunion) => {
          this.toastr.success('Réunion créée avec succès');
          this.router.navigate(['/reunions']);
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.toastr.error('Erreur lors de la création de la réunion');
          this.loading = false;
        }
      });
  }

  private updateReunion(): void {
    if (!this.reunionId) return;
    
    const request: UpdateReunionRequest = this.reunionForm.value;
    
    this.reunionService.updateReunion(this.reunionId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (reunion) => {
          this.toastr.success('Réunion mise à jour avec succès');
          this.router.navigate(['/reunions']);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.toastr.error('Erreur lors de la mise à jour de la réunion');
          this.loading = false;
        }
      });
  }

  onParticipantSelectionChange(): void {
    const selectedIds = this.reunionForm.get('participantIds')?.value || [];
    this.selectedParticipants = this.availableAgents.filter(agent => 
      selectedIds.includes(agent.id)
    );
  }

  onDateChange(): void {
    const dateDebut = this.reunionForm.get('dateDebut')?.value;
    const dateFin = this.reunionForm.get('dateFin')?.value;
    
    if (dateDebut && dateFin) {
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      
      if (fin <= debut) {
        this.reunionForm.get('dateFin')?.setErrors({ invalidDateRange: true });
      } else {
        this.reunionForm.get('dateFin')?.setErrors(null);
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/reunions']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reunionForm.controls).forEach(key => {
      const control = this.reunionForm.get(key);
      control?.markAsTouched();
    });
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  getTypeLabel(type: ReunionType): string {
    return this.reunionService.getReunionTypeLabel(type);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.reunionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.reunionForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Ce champ est obligatoire';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
      if (field.errors['invalidDateRange']) return 'La date de fin doit être après la date de début';
    }
    return '';
  }
} 