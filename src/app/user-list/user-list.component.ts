import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../models/User';
import { AuthenticationService } from '../service/authentication.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { UserRole } from '../models/role';
import { AdminCreateUserRequest } from '../models/AdminCreateUser';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];  // Holds the list of users
  errorMessage: string = '';  
  sortColumn = 'lastname'; // default sort column
sortDirection: 'asc' | 'desc' = 'asc';
expandedIndex: number | null = null;
editingEmailIndex: number | null = null;
availableRoles = [UserRole.ADMIN, UserRole.AGENT]; 
roleDropdownStates: Map<string, number> = new Map();


toggleRoleDropdown(user: User, roleIndex: number) {
  const userId = user.id!;
  if (this.roleDropdownStates.get(userId) === roleIndex) {
    this.roleDropdownStates.delete(userId);
  } else {
    this.roleDropdownStates.set(userId, roleIndex);
  }
}

isDropdownOpen(user: User, roleIndex: number): boolean {
  const userId = user.id!;
  return this.roleDropdownStates.get(userId) === roleIndex;
}


changeUserRole(userId: string, newRole: string): void {
  let formattedRole = newRole.toUpperCase();
  if (!formattedRole.startsWith('ROLE_')) {
    formattedRole = 'ROLE_' + formattedRole;
  }

  this.authenticationService.updateUserRole(userId, formattedRole).subscribe({
    next: () => {
      console.log('Role updated successfully');

      // Update the local users array immediately:
      const user = this.users.find(u => u.id === userId);
      if (user) {
        user.roles = [formattedRole]; // Assuming only one role at a time
        // Or if your app supports multiple roles, update accordingly
      }
      
      // Clear dropdown state so it closes after update
      this.roleDropdownStates.delete(userId);
      
      // Manually trigger change detection if needed (should happen automatically)
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error updating role:', error);
      alert('Error updating role. Check console for details.');
    }
  });
}


isUserAdminOrAgent(user: User): boolean {
  return user.roles.some(role => role === 'ROLE_ADMIN' || role === 'ROLE_AGENT');
}


onRoleClick(event: MouseEvent, userId: string, role: string) {
  event.stopPropagation(); // prevent dropdown from closing prematurely
  console.log('Role clicked:', userId, role);
  this.changeUserRole(userId, role);
}


closeDropdown(): void {
  this.roleDropdownStates.clear();
}


  selectedUser: User = {} as User;  
  newUser: AdminCreateUserRequest = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.USER, 
    enabled: true,
    accountLocked: false,
  };

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
  const updatedUser: AdminCreateUserRequest = {
    ...this.newUser,
    role: this.newUser.role
  };

  this.authenticationService.createUser(updatedUser).subscribe({
    next: (response) => {
      console.log('User added successfully', response);

      // Optional: if you want to show a success message before reload, you can use setTimeout.

      // Force full page reload
      window.location.reload();
    },
    error: (err) => {
      console.error('Error creating user', err);
      this.errorMessage = 'Failed to create user. Please try again later.';
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

        // Remove the user from the local list
        this.users = this.users.filter(u => u.id !== user.id);

        // Clear error if any
        this.errorMessage = '';
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

  // Add this inside your UserListComponent class, e.g. just after your existing properties

get sortedUsers(): User[] {
  // Return a sorted copy of users
  return [...this.users].sort((a, b) => {
    const col = this.sortColumn as keyof User;
    const valA = (a[col] || '').toString().toLowerCase();
    const valB = (b[col] || '').toString().toLowerCase();

    if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

sortBy(column: string): void {
  if (this.sortColumn === column) {
    // toggle sort direction
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
}

selectUser(user: User): void {
  this.selectedUser = user;
}

getRoleBadgeInfo(role: string): { label: string, cssClass: string, icon: string } {
  switch (role) {
    case 'ROLE_ADMIN':
      return { label: 'Admin', cssClass: 'admin', icon: 'fas fa-user-shield' };
    case 'ROLE_AGENT':
      return { label: 'Agent', cssClass: 'agent', icon: 'fas fa-user-tie' };
    case 'ROLE_USER':
      return { label: 'User', cssClass: 'user', icon: 'fas fa-user' };
    default:
      return { label: role.replace('ROLE_', ''), cssClass: 'user', icon: 'fas fa-user' };
  }
}

toggleExpanded(index: number) {
  this.expandedIndex = this.expandedIndex === index ? null : index;
}

startEditingEmail(index: number) {
  this.editingEmailIndex = index;
}

stopEditingEmail() {
  this.editingEmailIndex = null;
  // Here you could call a service to update the user email live
}

  
}
