import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sync-user`, {
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            google_id: account.providerAccountId,
          });
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
        return true;
      }
      return false;
    },
    async jwt({ token, account }) {
      if (account) {
        token.googleId = account.providerAccountId;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).googleId = token.googleId;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };