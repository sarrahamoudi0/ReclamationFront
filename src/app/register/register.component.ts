import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationRequest } from '../models/RegistrationRequest';
import { AuthenticationService } from '../service/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';  
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  imageFile?: File


  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.required]]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.imageFile = input.files[0];
  }
}

onSubmit() {
  if (this.registerForm.invalid) {
    return;
  }

  const registrationRequest: RegistrationRequest = this.registerForm.value;

  this.authService.register(registrationRequest, this.imageFile).subscribe(
    () => {
      this.router.navigate(['/activate']);
    },
    (error) => {
      this.errorMessage = error.message;
      console.error(error);
    }
  );
}


}
