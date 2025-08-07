import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    status: string;
  }

  interface Session {
    user: User & {
      role: UserRole;
      status: string;
    };
  }
}
