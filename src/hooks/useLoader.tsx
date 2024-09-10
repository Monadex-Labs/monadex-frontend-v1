'use client'
import { useEffect, useState } from 'react'

export function useLoader() {
  const [isLoaderRemoved, setIsLoaderRemoved] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

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

    setTimeout(removeLoader, 300)

    return () => {
      loader.remove()
      setIsLoaderRemoved(true)
    }
  }, [])

  return isLoaderRemoved
}