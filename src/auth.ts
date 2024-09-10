import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'

export const { signIn, signOut, auth, handlers } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: 'https://discord.com/oauth2/authorize?client_id=1245083094566965331&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fdiscord&scope=identify+email+guilds+applications.commands.permissions.update'

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
      // @ts-expect-error

      session.accessToken = token.accessToken
      return session
    }

  },
  secret: process.env.NEXTAUTH_SECRET

})
