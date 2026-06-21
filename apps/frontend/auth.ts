import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          },
        );

        if (!res.ok) return null;

        const data = await res.json();

        if (!data?.token || !data?.user?.id) return null;

        return {
          id: data.user.id,
          email: data.user.email,
          backendToken: data.token,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.backendToken = user.backendToken;
      }

      return token;
    },

    session({ session, token }) {
      session.user.id = token.userId as string;
      session.backendToken = token.backendToken as string;

      return session;
    },
  },

  pages: {
    signIn: "/auth?mode=signin",
  },
});
