import { Token } from '@monadex/sdk'
import { UBESWAP_TOKEN_LIST } from '@/data/default-token-list'
import { Tags, TokenInfo } from '@uniswap/token-lists'

type TagDetails = Tags[keyof Tags]
export interface TagInfo extends TagDetails {
  id: string
}

UBESWAP_TOKEN_LIST.tokens.forEach((t) => {
  if (t.address.toLocaleLowerCase() === '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC'.toLocaleLowerCase()) {
    t.name = 'Ubeswap Old'
    t.symbol = 'old-UBE'
    t.address = '0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC'
  }
})
UBESWAP_TOKEN_LIST.tokens.unshift({
  address: '0x71e26d0E519D14591b9dE9a0fE9513A398101490',
  name: 'Ubeswap',
  symbol: 'UBE',
  chainId: 42220,
  decimals: 18,
  logoURI: 'https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_UBE.png'
})

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  public readonly tags: TagInfo[]
  constructor (tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(tokenInfo.chainId, tokenInfo.address, tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name)
    this.tokenInfo = tokenInfo
    this.tags = tags
  }

  public get logoURI (): string | undefined {
    return this.tokenInfo.logoURI
  }
}
