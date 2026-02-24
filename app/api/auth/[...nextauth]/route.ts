import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { supabase } from '@/lib/supabase';

const handler = NextAuth({
  providers: [
    GithubProvider({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        const { data: { user } } = await supabase.from('profiles').select('*').eq('id', token.sub).single();
        session.user.id = user?.id || token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
});

export { handler as GET, handler as POST };
