'use server'
import { signIn, signOut } from '../auth'


export async function logIn() {
    try {
        console.log('dodo')
        await signIn('discord', { redirectTo: "/" })
      } catch (error) {
        console.error('Error during sign in:', error)
      }
}

export const logOut = async (): Promise<void> => {
  try {
    await signOut()
  } catch (error) {
    console.error('Error during sign out:', error)
  }
}