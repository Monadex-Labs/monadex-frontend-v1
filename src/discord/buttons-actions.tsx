import { logIn, logOut } from './ actions'
import { useSession } from 'next-auth/react'


export function SignIn() {
  
  const handleLogin = async () => {
    try {
      await logIn()
    } catch (error) {
      console.error('Login failed', error)
    }
  }
    const { data: session } = useSession()
    if (!session) return (
        <div>
            <form
                action={async () => {
                  await handleLogin()
                }}
            >
                <button type="submit"
                
                >
                    Login with Discord
                </button>
            </form>
        </div>
    )

    return (
        <></>
    )
} 

export function SignOut() {
    return (
      <div>
        <form
          action={async () => {
            await logOut()
          }}
        >
          <button type="submit">Logout</button>
        </form>
      </div>
    )
}