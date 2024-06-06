import React, { useState } from 'react'
import { HelpCircle } from 'react-feather'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

export interface LogoProps {
  srcs: string[]
  alt: string
}

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export default function Logo ({ srcs, alt, ...rest }: LogoProps): JSX.Element {
  const [, refresh] = useState<number>(0)

  const src: string | undefined = srcs.find((src) => !BAD_SRCS[src])

  if (src !== null && src !== undefined) {
    return (
      <img
        {...rest}
        alt={alt}
        src={src}
        onError={() => {
          BAD_SRCS[src] = true
          refresh((i) => i + 1)
        }}
      />
    )
  }

  return <HelpCircle {...rest} />
}
