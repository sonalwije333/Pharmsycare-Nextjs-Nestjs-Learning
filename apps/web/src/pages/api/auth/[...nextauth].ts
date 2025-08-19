import { getEnv } from '@/config/get-env';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: getEnv('GOOGLE_CLIENT_ID'),
      clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    FacebookProvider({
      clientId: getEnv('FACEBOOK_CLIENT_ID'),
      clientSecret: getEnv('FACEBOOK_CLIENT_SECRET'),
      authorization: {
        params: {
          scope: 'email,public_profile'
        }
      }
    })
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
  pages: {
    signIn: '/login', // Custom login page path
  },
});