import {UserRole} from './role';

export interface AdminCreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole; 
  enabled: boolean;
  accountLocked: boolean;
}
