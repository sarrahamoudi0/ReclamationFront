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
     banned: boolean;
}
