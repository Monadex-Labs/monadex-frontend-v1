import { useMemo } from 'react'

import uriToHttp from '@/utils/uriToHttp'

export default function useHttpLocations (uri: string | undefined): string[] {
  return useMemo(() => {
    return uri !== undefined && uri !== undefined ? uriToHttp(uri) : []
  }, [uri])
}
