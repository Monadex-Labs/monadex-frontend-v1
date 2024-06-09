import { parse, ParsedQs } from 'qs'
import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

export default function useParsedQueryString (): ParsedQs {
  const searchParams = useSearchParams()
  const search = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    return params.toString()
  }, [searchParams])

  return useMemo(
    () =>
      search && search.length > 1  // eslint-disable-line
        ? parse(search, { parseArrays: false, ignoreQueryPrefix: true })
        : {},
    [search]
  )
}
