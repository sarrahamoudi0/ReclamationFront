import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../models/User';
import { AuthenticationService } from '../service/authentication.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];  // Holds the list of users
  errorMessage: string = '';  // Holds any error message
  selectedUser: User = {} as User;  // Holds the user data for the modal
  newUser: User = {} as User;  // Holds the data for the new user to be added

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authenticationService.getUsers().subscribe({
      next: (users: any[]) => {
        this.users = users.map((user: any) => {
          if (user.role && !user.roles) {
            user.roles = [user.role]; // Create the expected 'roles' array
          }
          return user as User;
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to load users. Please try again later.';
        console.error('Error loading users', err);
      }
    });
  }

  getRole(roles: string[]): string {
    if (!roles || roles.length === 0) {
      return 'Aucun rôle'; // No role available
    }
    return roles[0].replace('ROLE_', '') || 'Inconnu'; // Display the first role, removing the 'ROLE_' prefix
  }

  openAddUserForm(): void {
    const modalElement = document.getElementById('addUserModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();  // Show the modal
    } else {
      console.error('Modal element not found');
    }
  }

  addUser(): void {
    if (!this.newUser.firstname || !this.newUser.lastname || !this.newUser.email || !this.newUser.roles) {
      this.errorMessage = 'Please fill out all fields.';
      return;
    }

    this.authenticationService.createUser(this.newUser).subscribe({
      next: (response) => {
        console.log('User added successfully', response);

        // Add the new user to the list
        this.users.push({ ...this.newUser });

        // Reset the newUser object
        this.newUser = {} as User;

        // Optionally, trigger change detection manually
        this.cdr.detectChanges();

        // Close the modal
        const modalElement = document.getElementById('addUserModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement); // Get the modal instance
          modal?.hide(); // Close the modal
        }
      },
      error: (err) => {
        console.error('Error adding user', err);
        this.errorMessage = 'Failed to add user. Please try again later.';
      }
    });
  }

  openUpdateModal(user: User): void {
    this.selectedUser = { ...user };  // Clone the user to avoid directly modifying the original

    const modalElement = document.getElementById('updateUserModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();  // Show the modal
    } else {
      console.error('Modal element not found');
    }
  }

  updateUser(): void {
    this.authenticationService.updateUser(this.selectedUser.id!, this.selectedUser).subscribe({
      next: (response: string) => {
        console.log('User updated successfully', response);

        const index = this.users.findIndex(user => user.id === this.selectedUser.id);
        if (index !== -1) {
          this.users[index] = { ...this.selectedUser };  // Replace the old user data with the updated one
        }

        this.cdr.detectChanges();

        // Close the modal
        const modalElement = document.getElementById('updateUserModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);  // Get the modal instance
          modal?.hide();  // Close the modal
        }
      },
      error: (err) => {
        console.error('Error updating user', err);
        this.errorMessage = 'Failed to update user. Please try again later.';
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user: ${user.firstname} ${user.lastname}?`)) {
      if (!user.id) {
        console.error('User ID is undefined');
        this.errorMessage = 'User ID is missing for deletion.';
        return;
      }
      this.authenticationService.deleteUser(user.id).subscribe({
        next: (response) => {
          console.log('User deleted successfully', response);
          this.loadUsers();  // Reload users after deletion
        },
        error: (err) => {
          console.error('Error deleting user', err);
          this.errorMessage = 'Failed to delete user. Please try again later.';
        }
      });
    }
  }

  displayError(): string {
    return this.errorMessage;
  }
}
