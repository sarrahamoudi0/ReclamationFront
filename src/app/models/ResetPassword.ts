export class ResetPassword {
    constructor(
      public token: string,
      public newPassword: string,
      public confirmPassword: string
    ) {}
  }
  