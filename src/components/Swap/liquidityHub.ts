import { useWalletData } from '@/utils'
import { wrappedCurrency } from '@/utils/wrappedCurrency'
import { NativeCurrency, Token, Trade, TradeType } from '@monadex/sdk'
import { useCallback } from 'react'
import { Field } from '@/state/swap/actions'
type actionState = 'pending' | 'success' | 'failed' | 'null' | ''
const PARTNER = 'Monadex'
const ANALYTICS_VERSION = 0.1
interface LiquidityHubAnalyticsData {
  _id: string
  partner: string
  chainId: number
  isForceClob: boolean
  firstFailureSessionId?: string
  sessionId?: string
  walletAddress: string
  dexAmountOut: string
  isClobTrade: boolean
  srcTokenAddress: string
  srcTokenSymbol: string
  dstTokenAddress: string
  dstTokenSymbol: string
  srcAmount: string
  quoteIndex: number
  slippage: number
  'quote-1-state': actionState
  'quote-2-state': string
  clobDexPriceDiffPercent: string

  approvalState: actionState
  approvalError: string
  approvalMillis: number | null

  signatureState: actionState
  signatureMillis: number | null
  signature: string
  signatureError: string

  swapState: actionState
  txHash: string
  swapMillis: number | null
  swapError: string

  wrapState: actionState
  wrapMillis: number | null
  wrapError: string
  wrapTxHash: string

  dexSwapState: actionState
  dexSwapError: string
  dexSwapTxHash: string

  userWasApprovedBeforeTheTrade?: boolean | string
  dstAmountOutUsd: number
  isProMode: boolean
  expertMode: boolean
  tradeType?: TradeType | null
  isNotClobTradeReason: string
  onChainClobSwapState: actionState
  version: number
  isDexTrade: boolean
  onChainDexSwapState: actionState
  dexOutAmountWS?: string
  walletConnectName?: string
  isRabby?: boolean
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
  isWalletConnect?: boolean
  isTrustWallet?: boolean
  isOkxWallet?: boolean
}

interface QuoteResponse {
  outAmount: string
  permitData: any
  serializedOrder: string
  callData: string
  rawData: any
}

interface QuoteArgs {
  minDestAmount: string
  inAmount: string
  inToken: string
  outToken: string
}
interface InitTradeArgs {
  srcTokenAddress?: string
  dstTokenAddress?: string
  srcTokenSymbol?: string
  dstTokenSymbol?: string
  walletAddress?: string
  slippage?: number
  srcAmount?: string
  dexAmountOut?: string
  dstTokenUsdValue?: number
  chainId: number
  dexOutAmountWS?: string
}
const initialData: Partial<LiquidityHubAnalyticsData> = {
  _id: crypto.randomUUID(),
  partner: PARTNER,
  isClobTrade: false,
  quoteIndex: 0,
  isForceClob: false,
  isDexTrade: false,
  version: ANALYTICS_VERSION
};
class LiquidityHubAnalytics {
  initialTimestamp = Date.now()
  data = initialData
  firstFailureSessionId = ''
  timeout: any = undefined

  updateChainId (chainId: number) {
    this.data.chainId = chainId
  }

  private updateAndSend (values = {} as Partial<LiquidityHubAnalyticsData>) {
    this.data = { ...this.data, ...values }

    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      sendBI(this.data)
    }, 1_000)
  }

  incrementQuoteIndex () {
    this.updateAndSend({
      quoteIndex: !this.data.quoteIndex ? 1 : this.data.quoteIndex + 1
    })
  }

  onQuoteRequest () {
    this.updateAndSend({ [`quote-${this.data.quoteIndex}-state`]: 'pending' })
  }

  onQuoteSuccess (quoteResponse: QuoteResponse, time: number) {
    this.updateAndSend({ [`quote-${this.data.quoteIndex}-state`]: 'success' })
    this.onQuoteData(quoteResponse, time)
  }

  onBestTrade (values: InitTradeArgs) {
    this.updateAndSend({ tradeType: TradeType.BEST_TRADE, ...values })
  }

  onTwapTrade (values: InitTradeArgs) {
    this.updateAndSend({ tradeType: TradeType.TWAP, ...values })
  }

  onLimitTrade (values: InitTradeArgs) {
    this.updateAndSend({ tradeType: TradeType.LIMIT, ...values })
  }

  onV2Trade (values: InitTradeArgs) {
    this.updateAndSend({ tradeType: TradeType.V2, ...values })
  }

  onQuoteFailed (error: string, time: number, quoteResponse?: QuoteResponse) {
    if (error == DEX_PRICE_BETTER_ERROR) {
      this.updateAndSend({
        isNotClobTradeReason: DEX_PRICE_BETTER_ERROR,
        [`quote-${this.data.quoteIndex}-state`]: 'success'
      })
    } else {
      this.updateAndSend({
        [`quote-${this.data.quoteIndex}-error`]: error,
        [`quote-${this.data.quoteIndex}-state`]: 'failed',
        isNotClobTradeReason: `quote-${this.data.quoteIndex}-failed`
      })
    }

    this.onQuoteData(quoteResponse, time)
  }

  onQuoteData (quoteResponse?: QuoteResponse, time?: number) {
    const getDiff = () => {
      if (!quoteResponse?.outAmount || !this.data.dexAmountOut) {
        return ''
      }
      return new BN(quoteResponse?.outAmount)
        .dividedBy(new BN(this.data.dexAmountOut))
        .minus(1)
        .multipliedBy(100)
        .toFixed(2)
    }

    this.updateAndSend({
      [`quote-${this.data.quoteIndex}-amount-out`]: quoteResponse?.outAmount,
      [`quote-${this.data.quoteIndex}-serialized-order`]: quoteResponse?.serializedOrder,
      [`quote-${this.data.quoteIndex}-quote-millis`]: time,
      clobDexPriceDiffPercent: getDiff()
    })
  }

  onApprovedBeforeTheTrade (userWasApprovedBeforeTheTrade: boolean) {
    this.updateAndSend({ userWasApprovedBeforeTheTrade })
  }

  onApprovalRequest () {
    this.updateAndSend({ approvalState: 'pending' })
  }

  onDexSwapRequest () {
    this.updateAndSend({ dexSwapState: 'pending', isDexTrade: true })
  }

  onDexSwapSuccess (response: any) {
    this.updateAndSend({
      dexSwapState: 'success',
      dexSwapTxHash: response.hash
    })

    this.pollTransaction({
      response,
      onSucess: () => {
        this.updateAndSend({ onChainDexSwapState: 'success' })
      },
      onFailed: () => {
        this.updateAndSend({ onChainDexSwapState: 'failed' })
      }
    })
  }

  onDexSwapFailed (dexSwapError: string) {
    this.updateAndSend({ dexSwapState: 'failed', dexSwapError })
  }

  onApprovalSuccess (time: number) {
    this.updateAndSend({ approvalMillis: time, approvalState: 'success' })
  }

  onApprovalFailed (error: string, time: number) {
    this.updateAndSend({
      approvalError: error,
      approvalState: 'failed',
      approvalMillis: time,
      isNotClobTradeReason: 'approval failed'
    })
  }

  onSignatureRequest () {
    this.updateAndSend({ signatureState: 'pending' })
  }

  onWrapRequest () {
    this.updateAndSend({ wrapState: 'pending' })
  }

  onWrapSuccess (txHash: string, time: number) {
    this.updateAndSend({
      wrapTxHash: txHash,
      wrapMillis: time,
      wrapState: 'success'
    })
  }

  onWrapFailed (error: string, time: number) {
    this.updateAndSend({
      wrapError: error,
      wrapState: 'failed',
      wrapMillis: time,
      isNotClobTradeReason: 'wrap failed'
    })
  }

  onSignatureSuccess (signature: string, time: number) {
    this.updateAndSend({
      signature,
      signatureMillis: time,
      signatureState: 'success'
    })
  }

  onWallet = (library: any) => {
    try {
      const walletConnectName = (library)?.provider?.session?.peer
        .metadata.name

      if (library.provider.isRabby) {
        this.updateAndSend({ walletConnectName, isRabby: true })
      } else if (library.provider.isWalletConnect) {
        this.updateAndSend({ walletConnectName, isWalletConnect: true })
      } else if (library.provider.isCoinbaseWallet) {
        this.updateAndSend({ walletConnectName, isCoinbaseWallet: true })
      } else if (library.provider.isOkxWallet) {
        this.updateAndSend({ walletConnectName, isOkxWallet: true })
      } else if (library.provider.isTrustWallet) {
        this.updateAndSend({ walletConnectName, isTrustWallet: true })
      } else if (library.provider.isMetaMask) {
        this.updateAndSend({ walletConnectName, isMetaMask: true })
      }
    } catch (error) {
      console.log('Error on wallet', error)
    }
  }

  onSignatureFailed (error: string, time: number) {
    this.updateAndSend({
      signatureError: error,
      signatureState: 'failed',
      signatureMillis: time,
      isNotClobTradeReason: 'signature failed'
    })
  }

  onSwapRequest () {
    this.updateAndSend({ swapState: 'pending' })
  }

  onSwapSuccess (txHash: string, time: number) {
    this.updateAndSend({
      txHash,
      swapMillis: time,
      swapState: 'success',
      isClobTrade: true,
      onChainClobSwapState: 'pending'
    })
  }

  onSwapFailed (error: string, time: number) {
    this.updateAndSend({
      swapError: error,
      swapState: 'failed',
      swapMillis: time,
      isNotClobTradeReason: 'swap failed'
    })
  }

  setSessionId (id: string) {
    this.data.sessionId = id
  }

  onForceClob () {
    this.updateAndSend({ isForceClob: true })
  }

  onIsProMode () {
    this.updateAndSend({ isProMode: true })
  }

  onExpertMode () {
    this.updateAndSend({ expertMode: true })
  }

  clearState () {
    this.data = {
      ...initialData,
      _id: crypto.randomUUID(),
      firstFailureSessionId: this.firstFailureSessionId
    }
  }

  async pollTransaction ({
    response,
    onSucess,
    onFailed
  }: {
    response: any
    onSucess: () => void
    onFailed: () => void
  }) {
    try {
      const receipt = await response.wait()
      if (receipt.status === 1) {
        onSucess()
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      onFailed()
    }
  }

  async onClobSuccess (response: any) {
    this.pollTransaction({
      response,
      onSucess: () => {
        this.updateAndSend({ onChainClobSwapState: 'success' })
      },
      onFailed: () => {
        {
          this.updateAndSend({
            onChainClobSwapState: 'failed',
            isNotClobTradeReason: 'onchain swap error'
          })
        }
      }
    })
  }

  onNotClobTrade (message: string) {
    this.updateAndSend({ isNotClobTradeReason: message })
  }

  onClobFailure () {
    this.firstFailureSessionId =
        this.firstFailureSessionId || this.data.sessionId || ''
  }
}

function delay (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitForTx (txHash: string, library: any): Promise<any> {
  for (let i = 0; i < 30; ++i) {
    // due to swap being fetch and not web3

    await delay(2_000) // to avoid potential rate limiting from public rpc
    try {
      const tx = await library.getTransaction(txHash);
      if (tx && tx instanceof Object && (tx.blockNumber != null)) {
        return tx
      }
    } catch (error) {}
  }
}

export const liquidityHubAnalytics = new LiquidityHubAnalytics()
export const useV2TradeTypeAnalyticsCallback = (
  currencies: {
    INPUT?: NativeCurrency | undefined
    OUTPUT?: NativeCurrency | undefined
  },
  allowedSlippage: number
): (trade: Trade | undefined) => void => {
  const { account, chainId } = useWalletData()

  const srcTokenCurrency = currencies[Field.INPUT]
  const dstTokenCurrency = currencies[Field.OUTPUT]
  const inToken = wrappedCurrency(srcTokenCurrency, chainId)
  const outToken = wrappedCurrency(dstTokenCurrency, chainId)
  return useCallback(
    (trade?: Trade) => {
      try {
        liquidityHubAnalytics.onV2Trade({
          srcTokenAddress: inToken?.address,
          dstTokenAddress: outToken?.address,
          srcTokenSymbol: inToken?.symbol,
          dstTokenSymbol: outToken?.symbol,
          srcAmount: trade?.inputAmount.raw.toString(),
          dexAmountOut: trade?.outputAmount.raw.toString(),
          walletAddress: account || '', // eslint-disable-line
          slippage: allowedSlippage / 100,
          chainId
        })
      } catch (error) {}
    },
    [account, inToken, outToken, allowedSlippage, chainId]
  )
}
