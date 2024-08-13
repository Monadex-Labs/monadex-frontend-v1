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
      clientId: '1245083094566965331',
      clientSecret: 'Joid9UUXUZl7xYDMFWQ_KYwesnTwiafw',
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
  secret: 'nslN3FXUfe12xWe6mIg0R9O8efvsZGx8yvYkVvjcMM8='
})
