import { ChainId } from '@monadex/sdk'
import monad from './monad.json'
import base from './base.json'
import monad_testnet from './monad_testnet.json'
const configs: any = {
  [ChainId.SEPOLIA]: base,
  [ChainId.MONAD]: monad,
  [ChainId.MONAD_TESTNET]: monad_testnet

}

export const getConfig = (network: ChainId | undefined): any => {
  if (network === undefined) {
    return configs[ChainId.SEPOLIA]
  }
  const config = configs[network]
  return config
}
