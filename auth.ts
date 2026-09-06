import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

import { isAllowed } from '@/lib/allowlist';

export { allowedEmails, isAllowed } from '@/lib/allowlist';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google], // reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
  session: { strategy: 'jwt' }, // no DB adapter, no users table
  pages: { signIn: '/prijava', error: '/prijava' },
  trustHost: true, // required behind Vercel's proxy
  callbacks: {
    async signIn({ profile }) {
      if (profile?.email_verified === false) return false;
      return isAllowed(profile?.email);
    },
    async jwt({ token, profile }) {
      if (profile?.email) token.email = profile.email.toLowerCase();
      if (profile?.name) token.name = profile.name;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
});
