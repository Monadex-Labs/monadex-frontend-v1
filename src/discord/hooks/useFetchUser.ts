import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Session } from 'next-auth'
import { useSession as useNextAuthSession } from 'next-auth/react'

// GET USER XP
export const useFetchUserXP = (session: Session | null): {
  userXP: number | null
  isLoading: boolean
} => {
  const [userXP, setUserXP] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserXP (): Promise<void> {
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
    }
    fetchUserXP()
  }, [session])

  return { userXP, isLoading }
}

// Get the current user's session and memorize it (perf improvement)
export const useDiscordSession = (): Session | null => {
  const { data: session } = useNextAuthSession()
  const memoizedSession = useMemo(() => session, [session])
  return memoizedSession
}
