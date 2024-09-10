import { logIn, logOut } from './ actions'
import { useSession } from 'next-auth/react'

export function SignIn () {
  const { data: session } = useSession()

  const handleLogin = async () => {
    try {
      await logIn()
    } catch (error) {
      console.error('Login failed', error)
    }
  }

  if (session == null) {
    return (
      <div>
        <form
          action={async () => {
            await handleLogin()
          }}
        >
          <button type='submit'>
            Login with Discord
          </button>
        </form>
      </div>
    )
  }

  return (
    <></>
  )
}

export function SignOut () {
  const { data: session } = useSession()
  return (
    <div>
      <form
        action={async () => {
          await logOut()
        }}
      >
        <button type='submit'>@{session?.user?.name}</button>
      </form>
    </div>
  )
}
