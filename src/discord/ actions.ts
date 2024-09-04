'use server'
import { signIn, signOut } from '@/auth'

export async function logIn () {
  await signIn('discord')
}

export async function logOut () {
  await signOut()
}
