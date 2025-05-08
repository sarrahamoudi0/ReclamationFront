export interface User {
    id?: string;
    firstname: string;
    lastname: string;
    email: string;
    password?: string; // Optional for security, don't send it from backend unless necessary
    phone: string;
    accountLocked: boolean;
    enabled: boolean;
    roles: string[];
    createdDate?: string; // ISO string, e.g., "2024-05-01T13:45:00"
    lastModifiedDate?: string;
  }
export interface User {
  id?: string;                  // Optional because it may not be provided when creating a new user
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  accountLocked: boolean;       // Indicates whether the account is locked
  enabled: boolean;             // Indicates whether the account is enabled
  roles: string[];              // Array of roles (e.g., ["USER", "ADMIN"])
  createdDate?: string;         // Optional, ISO string, e.g., "2024-05-01T13:45:00"
  lastModifiedDate?: string;    // Optional, ISO string for last modification date
}
