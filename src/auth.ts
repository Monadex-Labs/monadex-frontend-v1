import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

export const {
  signIn,
  signOut,
  auth,
  handlers: { GET, POST }
} = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: {
        params: {
          scope:
            'identify email guilds applications.commands.permissions.update'
        }
      }
    })
  ],
  callbacks: {
    async jwt ({ token, account }) {
      if (account != null) {
        token.accessToken = account.access_token
      }
      return token
    },

    async session ({ session, token, user }) {
      // @ts-expect-error session.accessToken does not exist
      session.accessToken = token.accessToken
      return session
    }
  },
  secret: process.env.AUTH_DISCORD_SECRET
})
