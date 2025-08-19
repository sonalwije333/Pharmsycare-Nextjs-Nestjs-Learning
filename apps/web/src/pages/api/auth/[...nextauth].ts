import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
        token.access_token = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        provider: token.provider,
        access_token: token.access_token,
      };
    },
  },

  debug: process.env.NODE_ENV === 'development',
});