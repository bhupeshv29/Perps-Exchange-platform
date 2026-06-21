import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    backendToken?: string;
    user: DefaultSession["user"] & {
      id: string;
    };
  }

  interface User {
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string;
    backendToken?: string;
  }
}