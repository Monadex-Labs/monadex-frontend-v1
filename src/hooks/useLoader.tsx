'use client'
import { useEffect, useState } from 'react'

export function useLoader(): boolean {
  const [isLoaderRemoved, setIsLoaderRemoved] = useState(false)

  useEffect(() => {
    const loader = document.getElementById('globalLoader')
    if (!loader) {
      setIsLoaderRemoved(true)
      return
    }

    loader.style.opacity = '1'
    loader.style.transition = 'opacity 0.5s ease'

    const removeLoader = () => {
      loader.style.opacity = '0'
      loader.addEventListener('transitionend', () => {
        loader.remove()
        setIsLoaderRemoved(true)
      }, { once: true })
    }

    // Wait for 2000ms before removing the loader
    const timer = setTimeout(() => {
      removeLoader()
    }, 2000)

    return () => {
      clearTimeout(timer)
      loader.remove()
      setIsLoaderRemoved(true)
    }
  }, [])

  return isLoaderRemoved
}