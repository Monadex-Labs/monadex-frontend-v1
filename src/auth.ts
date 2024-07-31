import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
 
export const { signIn, signOut, auth, handlers: {GET, POST} } = NextAuth({
    providers: [
        Discord({
          clientId: '1245083094566965331',
          clientSecret: 'Joid9UUXUZl7xYDMFWQ_KYwesnTwiafw',
          authorization: {
            params: {
              scope: 'identify email guilds applications.commands.permissions.update'
            }
          }
        })

      ],
      callbacks: {
       
        async jwt({ token, account }){
            if (account){
              token.accessToken = account.access_token
            }
            return token;
        },

        async session({ session, token, user }) {
          //@ts-ignore
          
            session.accessToken = token.accessToken
            return session;
        },

    },
    secret: 'nslN3FXUfe12xWe6mIg0R9O8efvsZGx8yvYkVvjcMM8=',

    })
