
import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
 
export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth({
  providers: [Discord],
})


