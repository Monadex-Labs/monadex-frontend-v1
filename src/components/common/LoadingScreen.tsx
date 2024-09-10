'use client'
import { useLoader } from '@/hooks/useLoader'
import Image from 'next/image'
import molandak from '@/static/assets/hedgehog.png'

const LoadingScreen = () => {
  const isLoaderRemoved = useLoader()

  if (isLoaderRemoved) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bgColor">
      <div className="text-center flex flex-col items-center">
        <Image
          src={molandak}
          alt="Loading"
          width={100}
          height={100}
          className="animate-spin-slow"
        />
        <p className="mt-4 text-white text-xl">Loading contracts</p>
      </div>
    </div>
  )
}

export default LoadingScreen