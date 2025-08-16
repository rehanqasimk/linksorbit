import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    status: string;
    siteId?: string;
  }

  interface Session {
    user: User & {
      role: UserRole;
      status: string;
      siteId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    status: string;
    siteId?: string;
  }
}
