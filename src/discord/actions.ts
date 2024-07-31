'use server'
import { signIn, signOut } from '../auth'

export const logIn = async (): Promise<void> => {
  try {
    console.log('ici discord')
    await signIn('discord')
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
