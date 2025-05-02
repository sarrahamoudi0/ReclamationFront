// reset-password.model.ts
export class ResetPassword {
    token: string;
    newPassword: string;
    confirmPassword: string; // Added confirmPassword field

    constructor(token: string, newPassword: string, confirmPassword: string) {
      this.token = token;
      this.newPassword = newPassword;
      this.confirmPassword = confirmPassword; // Initialize confirmPassword
    }
}
