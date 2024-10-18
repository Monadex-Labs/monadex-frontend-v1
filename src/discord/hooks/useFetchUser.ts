import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Session } from 'next-auth'
import { useSession as useNextAuthSession } from 'next-auth/react'

// GET USER XP
export const useFetchUser = (session: Session | null): {
  userXP: number | null
  isLoading: boolean
  fetchUser: () => any
} => {
  const [userXP, setUserXP] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchUser (): Promise<any> {
    // GRAB TOKEN SESSION
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        // @ts-expect-error
        Authorization: `Bearer ${session?.accessToken as string}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const userData = await userResponse.json()

    // CALL ENDPONT GET XP BALANCE
    try {
      const data = await axios.get('/api/mxp', {
        params: {
          id: userData.id
        }
      })
      setUserXP(data.data.data)
      setIsLoading(false)
    } catch (error) {
      console.debug('ERROR: ', error)
    }
    return userData
  }
  useEffect(() => {
    fetchUser()
  }, [session, isLoading, userXP])

  return { userXP, isLoading, fetchUser }
}

// Get the current user's session and memorize it (perf improvement)
export const useDiscordSession = (): Session | null => {
  const { data: session } = useNextAuthSession()
  const memoizedSession = useMemo(() => session, [session])
  return memoizedSession
}
