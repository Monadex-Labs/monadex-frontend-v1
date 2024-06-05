import { DEFAULT_TOKEN_LIST } from '@/constants/index'

// use ordering of default list of lists to assign priority
export default function sortByListPriority (urlA: string, urlB: string): number {
  const first = DEFAULT_TOKEN_LIST.includes(urlA) ? DEFAULT_TOKEN_LIST.indexOf(urlA) : Number.MAX_SAFE_INTEGER
  const second = DEFAULT_TOKEN_LIST.includes(urlB) ? DEFAULT_TOKEN_LIST.indexOf(urlB) : Number.MAX_SAFE_INTEGER

  // need reverse order to make sure mapping includes top priority last
  if (first < second) return 1
  else if (first > second) return -1
  return 0
}
