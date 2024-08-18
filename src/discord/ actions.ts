'use server'
import { signIn, signOut } from '@/auth'


export async function logIn() {
  await signIn('discord')  
}

export const logOut = async (): Promise<void> => {
  await signOut()
}