'use client'
import { useEffect, useState } from 'react'

export function useLoader (): boolean {
  const [isLoaderRemoved, setIsLoaderRemoved] = useState(false)

  useEffect(() => {
  // Wait for 2000ms before removing the loader
    setTimeout(() => {
      setIsLoaderRemoved(true)
    }, 2000)
  }, [])

  return isLoaderRemoved
}
