// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'
import { ChainId } from '@monadex/sdk'

// const TEST_PRIVATE_KEY = Cypress.env('INTEGRATION_TEST_PRIVATE_KEY')
const TEST_PRIVATE_KEY = '3f48580fd503b96aad8de9253fe7f3adab8ba88a98277a34fc213888a0649d18'
// address of the above key
export const TEST_ADDRESS_NEVER_USE = new Wallet(TEST_PRIVATE_KEY).address
export const TEST_ADDRESS_NEVER_USE_SHORTENED = `${TEST_ADDRESS_NEVER_USE.slice(0, 6)}...${TEST_ADDRESS_NEVER_USE.slice(-4, 4)}`

class CustomizedBridge extends Eip1193Bridge {
  // monad chainId
  chainId = 84532
  async sendAsync (...args) {
    console.debug('sendAsync called', ...args)
    return await this.send(...args)
  }

  async send (...args) {
    console.debug('send called', ...args)
    const isCallbackForm =
      typeof args[0] === 'object' && typeof args[1] === 'function'
    let callback, method, params

    if (isCallbackForm) {
      callback = args[1]
      method = args[0].method
      params = args[0].params
    } else {
      method = args[0]
      params = args[1]
    }
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      if (isCallbackForm) {
        callback({ result: [TEST_ADDRESS_NEVER_USE] })
      } else {
        return await Promise.resolve([TEST_ADDRESS_NEVER_USE])
      }
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        callback(null, { result: '0x14a74' })
      } else {
        return await Promise.resolve('0x14a74')
      }
    }

    try {
      const result = await super.send(method, params)
      console.debug('result received', method, params, result)
      if (isCallbackForm) {
        callback(null, { result })
      } else {
        return result
      }
    } catch (error) {
      if (isCallbackForm) {
        callback(error, null)
      } else {
        throw error
      }
    }
  }
}

// sets up the injected provider to be a mock ethereum provider with the given mnemonic/index
Cypress.Commands.overwrite('visit', (original, url, options) => {
  return original(
    url.startsWith('/') && url.length > 2 && !url.startsWith('/#')
      ? `/#${url}`
      : url,
    {
      ...options,
      onBeforeLoad (win) {
        options && options.onBeforeLoad && options.onBeforeLoad(win)
        win.localStorage.clear()
        const provider = new JsonRpcProvider(
          'https://base-sepolia-rpc.publicnode.com', // chain to monad RPC LATER ON
          84532 // chain to Monad chain later on
        )
        const signer = new Wallet(TEST_PRIVATE_KEY, provider)
        win.ethereum = new CustomizedBridge(signer, provider)
        // Debugging: check if window.ethereum is set correctly
        console.log('window.ethereum', win.ethereum)
      }
    }
  )
})
