import gql from 'graphql-tag'

export const PAIR_CHART: any = gql`
query pairDayDatas($pairAddress: Bytes!, $skip: Int!) {
    pairDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: asc, where: { pairAddress: $pairAddress }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
    }
  }
`
export const PAIR_DAY_DATA = gql`
  query pairDayDatas($pairAddress: Bytes!, $date: Int!) {
    pairDayDatas(first: 1, orderBy: date, orderDirection: desc, where: { pairAddress: $pairAddress, date_lt: $date }) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      totalSupply
      reserveUSD
    }
  }
`

export const ALL_PAIRS: any = gql`
  query pairs {
    pairs(first: 500, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      token0 {
        id
        symbol
        name
      }
      token1 {
        id
        symbol
        name
      }
    }
  }
`
const PairFields: string = `
  fragment PairFields on Pair {
    id
    txCount
    token0 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    token1 {
      id
      symbol
      name
      totalLiquidity
      derivedETH
    }
    reserve0
    reserve1
    reserveUSD
    totalSupply
    trackedReserveETH
    reserveETH
    volumeUSD
    untrackedVolumeUSD
    token0Price
    token1Price
    createdAtTimestamp
  }
`
// used for getting top tokens by daily volume
export const TOKEN_TOP_DAY_DATAS = gql`
  query tokenDayDatas($date: Int) {
    tokenDayDatas(first: 50, orderBy: totalLiquidityUSD, orderDirection: desc, where: { date_gt: $date }) {
      id
      date
    }
  }
`

export const PAIR_DATA = (pairAddress: string, block: number) => {
  const queryString: any = `
      ${PairFields}
      query pairs {
        pairs(${block ? `block: {number: ${block}}` : ''} where: { id: "${pairAddress}"} ) {
          ...PairFields
        }
      }`
  return gql(queryString)
}

export const PAIRS_BULK = gql`
  ${PairFields}
  query pairs($allPairs: [Bytes]!) {
    pairs(first: 500, where: { id_in: $allPairs }, orderBy: trackedReserveETH, orderDirection: desc) {
      ...PairFields
    }
  }
`

export const PAIRS_HISTORICAL_BULK = (block: number, pairs: string[]) => {
  let pairsString = '['
  pairs.map((pair) => {
    return (pairsString += `"${pair}"`)
  })
  pairsString += ']'
  const queryString: any = `
    ${PairFields}
    query pairs {
      pairs(first: 200, where: {id_in: ${pairsString}}, block: {number: ${block}}, orderBy: trackedReserveETH, orderDirection: desc) {
       ...PairFields
      }
    }
    `
  return gql(queryString)
}

/** PULL BLOCKS FROM BLOCKCHAIN **/

export const GET_BLOCKS = (timestamps: any) => {
  let queryString = 'query blocks {'
  queryString += timestamps.map((timestamp: any) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }`
  })
  queryString += '}'
  return gql(queryString)
}
