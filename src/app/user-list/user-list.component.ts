import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../models/User';
import { AuthenticationService } from '../service/authentication.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { UserRole } from '../models/role';
import { AdminCreateUserRequest } from '../models/AdminCreateUser';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];  // Holds the list of users
  errorMessage: string = '';
  sortColumn = 'lastname'; // default sort column
sortDirection: 'asc' | 'desc' = 'asc';
expandedIndex: number | null = null;
editingEmailIndex: number | null = null;
availableRoles = [UserRole.ADMIN, UserRole.AGENT];
roleDropdownStates: Map<string, number> = new Map();
pageSize = 5;
currentPage = 1;
searchTerm: string = '';
filteredUsers: User[] = [];
showAddUserModal = false;
filterEmail: string = '';
filterRole: string = '';
filterStatus: string = '';

userRoles = Object.values(UserRole);

applyFilters(): void {
  this.filteredUsers = this.users.filter(user => {
    if (this.filterEmail && !user.email.toLowerCase().includes(this.filterEmail.toLowerCase())) {
      return false;
    }

    if (this.filterRole) {
      const userRolesNormalized = user.roles.map(r => r.replace('ROLE_', ''));
      if (!userRolesNormalized.includes(this.filterRole)) {
        return false;
      }
    }

   if (this.filterStatus) {
  if (this.filterStatus === 'active' && (user.banned || !user.enabled)) return false;
  if (this.filterStatus === 'banned' && !user.banned) return false;
}


    return true;
  });

  this.currentPage = 1; // reset to first page
}


clearFilters(): void {
  this.filterEmail = '';
  this.filterRole = '';
  this.filterStatus = '';
  this.applyFilters();
}


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

  // Add modal state tracking
  private addModalInstance: any = null;
  private updateModalInstance: any = null;
  private isModalOpening: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    // Debug: Check if Bootstrap is available
    setTimeout(() => {
      if (typeof bootstrap !== 'undefined') {
        console.log('Bootstrap is available');
      } else {
        console.log('Bootstrap is not available, using fallback');
      }

      // Check if modal elements exist
      const addModal = document.getElementById('addUserModal');
      const updateModal = document.getElementById('updateUserModal');
      console.log('Add modal element:', addModal ? 'Found' : 'Not found');
      console.log('Update modal element:', updateModal ? 'Found' : 'Not found');

      // Ensure modals are initially hidden
      this.forceCloseModal('addUserModal');
      this.forceCloseModal('updateUserModal');
    }, 1000);
  }

  // Prevent any accidental modal opening
  private preventAccidentalModalOpen(): void {
    // Remove any existing modal event listeners that might cause accidental opening
    const addModal = document.getElementById('addUserModal');
    const updateModal = document.getElementById('updateUserModal');

    if (addModal) {
      // Remove any existing Bootstrap modal instances
      try {
        const existingInstance = bootstrap.Modal.getInstance(addModal);
        if (existingInstance) {
          existingInstance.dispose();
        }
      } catch (e) {
        console.log('No existing add modal instance to dispose');
      }
    }

    if (updateModal) {
      // Remove any existing Bootstrap modal instances
      try {
        const existingInstance = bootstrap.Modal.getInstance(updateModal);
        if (existingInstance) {
          existingInstance.dispose();
        }
      } catch (e) {
        console.log('No existing update modal instance to dispose');
      }
    }
  }

  loadUsers(): void {
    this.authenticationService.getUsers().subscribe({
      next: (users: any[]) => {
        this.users = users.map((user: any) => {
          if (user.role && !user.roles) {
            user.roles = [user.role];
          }
          return user as User;
        });
        this.onSearch(); // Initialize filteredUsers
      },
      error: (err) => {
        this.errorMessage = 'Failed to load users. Please try again later.';
        console.error('Error loading users', err);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.firstname.toLowerCase().includes(term) ||
        user.lastname.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.toLowerCase().includes(term))
      );
    }
    this.currentPage = 1; // Reset to first page when searching
  }

  getRole(roles: string[]): string {
    if (!roles || roles.length === 0) {
      return 'Aucun rôle'; // No role available
    }
    return roles[0].replace('ROLE_', '') || 'Inconnu'; // Display the first role, removing the 'ROLE_' prefix
  }
openAddUserForm(): void {
  // Reset form data
  this.newUser = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.AGENT,
    enabled: true,
    accountLocked: false
  };
  this.errorMessage = '';
  this.showAddUserModal = true;
}


  addUser(): void {
    const updatedUser: AdminCreateUserRequest = {
      ...this.newUser,
      role: this.newUser.role
    };
    this.authenticationService.createUser(updatedUser).subscribe({
      next: (response) => {
        this.toastrService.success('Utilisateur créé avec succès');
        this.showAddUserModal = false;
        this.errorMessage = '';
        this.resetPageState();
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = "Échec de la création de l'utilisateur. Veuillez réessayer plus tard.";
        console.error('Error creating user:', err);
      }
    });
  }

  openUpdateModal(user: User): void {
    // Prevent multiple simultaneous opens
    if (this.isModalOpening) {
      console.log('Modal already opening, ignoring request');
      return;
    }

    console.log('Opening Update User Modal for user:', user.id);
    this.isModalOpening = true;

    // Prevent any accidental modal opening
    this.preventAccidentalModalOpen();

    // Clone the user to avoid directly modifying the original
    this.selectedUser = { ...user };

    // Clear any previous error messages
    this.errorMessage = '';

    const modalElement = document.getElementById('updateUserModal');
    if (modalElement) {
      try {
        // Force close any existing modal first
        this.forceCloseModal('updateUserModal');

        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined') {
          // Create new modal instance with strict options
          this.updateModalInstance = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: false,
            focus: true
          });

          // Add event listeners for proper cleanup
          const hiddenListener = () => {
            this.onModalHidden();
            this.updateModalInstance = null;
            this.isModalOpening = false;
            modalElement.removeEventListener('hidden.bs.modal', hiddenListener);
          };

          modalElement.addEventListener('hidden.bs.modal', hiddenListener);

          // Show modal
          this.updateModalInstance.show();
          console.log('Update user modal opened successfully with Bootstrap');
        } else {
          // Use fallback method
          console.log('Using fallback modal method for update user');
          this.showFallbackModal('updateUserModal');
        }
      } catch (error) {
        console.error('Error opening update user modal:', error);
        this.isModalOpening = false;
      }
    } else {
      console.error('Update user modal element not found');
      this.isModalOpening = false;
    }
  }

  updateUser(): void {
    this.authenticationService.updateUser(this.selectedUser.id!, this.selectedUser).subscribe({
      next: (response: string) => {
        console.log('User updated successfully', response);
        this.toastrService.success('Utilisateur mis à jour avec succès');

        // Update the local user data
        const index = this.users.findIndex(user => user.id === this.selectedUser.id);
        if (index !== -1) {
          this.users[index] = { ...this.selectedUser };
        }

        // Update filtered users as well
        const filteredIndex = this.filteredUsers.findIndex(user => user.id === this.selectedUser.id);
        if (filteredIndex !== -1) {
          this.filteredUsers[filteredIndex] = { ...this.selectedUser };
        }

        this.cdr.detectChanges();

        // Close the modal properly
        this.closeModal('updateUserModal');

        // Clear error message
        this.errorMessage = '';

        // Reset page state
        this.resetPageState();
      },
      error: (err) => {
        console.error('Error updating user', err);
        this.errorMessage = 'Failed to update user. Please try again later.';
      }
    });
  }

  // Method to handle cancel action
  cancelAction(modalId: string): void {
    console.log('Canceling action for modal:', modalId);

    // Close the modal
    this.closeModal(modalId);

    // Reset form data
    if (modalId === 'addUserModal') {
      this.resetAddUserForm();
    } else if (modalId === 'updateUserModal') {
      this.resetUpdateUserForm();
    }

    // Reset page state
    this.resetPageState();
  }

  // Reset add user form
  private resetAddUserForm(): void {
    this.newUser = {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      password: '',
      role: UserRole.AGENT,
      enabled: true,
      accountLocked: false
    };
    this.errorMessage = '';
  }

  // Reset update user form
  private resetUpdateUserForm(): void {
    this.selectedUser = {} as User;
    this.errorMessage = '';
  }

  // Reset page state
  private resetPageState(): void {
    // Reset search
    this.searchTerm = '';

    // Reset pagination
    this.currentPage = 1;

    // Reset filtered users to show all users
    this.filteredUsers = [...this.users];

    // Clear any error messages
    this.errorMessage = '';

    // Force change detection
    this.cdr.detectChanges();

    console.log('Page state reset successfully');
  }

  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur: ${user.firstname} ${user.lastname}?`)) {
      if (!user.id) {
        console.error('User ID is undefined');
        this.errorMessage = 'User ID is missing for deletion.';
        return;
      }

      this.authenticationService.deleteUser(user.id).subscribe({
        next: (response) => {
          console.log('User deleted successfully', response);
          this.toastrService.success('Utilisateur supprimé avec succès');

          // Remove the user from the local list
          this.users = this.users.filter(u => u.id !== user.id);
          this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);

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

  closeModal(modalId: string): void {
    console.log('Closing modal:', modalId);

    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      try {
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined') {
          if (modalId === 'addUserModal' && this.addModalInstance) {
            this.addModalInstance.hide();
            this.addModalInstance.dispose();
            this.addModalInstance = null;
          } else if (modalId === 'updateUserModal' && this.updateModalInstance) {
            this.updateModalInstance.hide();
            this.updateModalInstance.dispose();
            this.updateModalInstance = null;
          } else {
            // Force close manually
            this.forceCloseModal(modalId);
          }
        } else {
          // Use fallback method
          this.forceCloseModal(modalId);
        }
      } catch (error) {
        console.error('Error closing modal:', error);
        // Force close manually
        this.forceCloseModal(modalId);
      }
    }

    // Clear error messages when closing modals
    this.errorMessage = '';
    this.isModalOpening = false;
  }

  // Force close modal regardless of state
  private forceCloseModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      // Remove any existing modal classes
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');

      // Remove backdrop
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());

      // Dispose Bootstrap instance if exists
      if (modalId === 'addUserModal' && this.addModalInstance) {
        try {
          this.addModalInstance.dispose();
        } catch (e) {
          console.log('Error disposing add modal instance:', e);
        }
        this.addModalInstance = null;
      } else if (modalId === 'updateUserModal' && this.updateModalInstance) {
        try {
          this.updateModalInstance.dispose();
        } catch (e) {
          console.log('Error disposing update modal instance:', e);
        }
        this.updateModalInstance = null;
      }
    }
  }

  // Fallback modal show method
  private showFallbackModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');

      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop show';
      backdrop.id = 'modal-backdrop';
      document.body.appendChild(backdrop);

      // Close on backdrop click
      backdrop.addEventListener('click', () => {
        this.closeModal(modalId);
      });
    }
  }

  // Method to handle modal hidden events
  onModalHidden(): void {
    console.log('Modal hidden event triggered');
    this.errorMessage = '';
    this.isModalOpening = false;

    // Clear modal instances
    this.addModalInstance = null;
    this.updateModalInstance = null;
  }

  // Clean up modal instances on component destroy
  ngOnDestroy(): void {
    console.log('Component destroying, cleaning up modals');

    // Force close any open modals
    this.forceCloseModal('addUserModal');
    this.forceCloseModal('updateUserModal');

    // Clear instances
    if (this.addModalInstance) {
      try {
        this.addModalInstance.dispose();
      } catch (e) {
        console.log('Error disposing add modal on destroy:', e);
      }
      this.addModalInstance = null;
    }
    if (this.updateModalInstance) {
      try {
        this.updateModalInstance.dispose();
      } catch (e) {
        console.log('Error disposing update modal on destroy:', e);
      }
      this.updateModalInstance = null;
    }

    this.isModalOpening = false;
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

toggleBan(userId: string) {
  // Find the user to get their current status and name
  const user = this.users.find(u => u.id === userId);
  if (!user) return;

  const isCurrentlyBanned = user.banned;
  const userName = `${user.firstname} ${user.lastname}`;
  
  // Show confirmation dialog
  Swal.fire({
    title: isCurrentlyBanned ? 'Débannir l\'utilisateur' : 'Bannir l\'utilisateur',
    text: `Êtes-vous sûr de vouloir ${isCurrentlyBanned ? 'débannir' : 'bannir'} l'utilisateur "${userName}" ?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: isCurrentlyBanned ? '#28a745' : '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: isCurrentlyBanned ? 'Oui, débannir' : 'Oui, bannir',
    cancelButtonText: 'Annuler',
    customClass: { popup: 'swal2-popup-custom' }
  }).then((result: any) => {
    if (result.isConfirmed) {
      this.authenticationService.banOrUnbanUser(userId).subscribe({
        next: () => {
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Statut modifié avec succès !',
            text: `L'utilisateur "${userName}" est maintenant ${isCurrentlyBanned ? 'actif' : 'banni'}`,
            confirmButtonColor: '#28a745',
            confirmButtonText: 'Parfait !',
            customClass: { popup: 'swal2-popup-custom' }
          });
          
          // Refresh the user list
          this.loadUsers();
        },
        error: err => {
          console.error('Erreur lors du bannissement/débanissement', err);
          
          // Show error message
          Swal.fire({
            icon: 'error',
            title: 'Erreur lors de la modification',
            text: `Une erreur s'est produite lors de la modification du statut de "${userName}". Veuillez réessayer plus tard.`,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Compris',
            customClass: { popup: 'swal2-popup-custom' }
          });
        }
      });
    }
  });
}

get pagedUsers(): User[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.filteredUsers.slice(start, start + this.pageSize);
}

get totalPages(): number {
  return Math.ceil(this.filteredUsers.length / this.pageSize);
}

goToPage(page: number): void {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
}

getCurrentPageEnd(): number {
  return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length);
}


}
