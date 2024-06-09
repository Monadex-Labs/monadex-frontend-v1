import { BigNumberish } from '@ethersproject/bignumber'
import { BytesLike } from '@ethersproject/bytes'
import { Pair, Percent, Price, Route, Token, TokenAmount, Trade, TradeType, ROUTER_ADDRESS, ChainId } from '@monadex/sdk'

export interface TradeRouter {
  routerAddress?: string
}

export const defaultRouter: TradeRouter = {
  routerAddress: ROUTER_ADDRESS[0]
}

export interface PurchaseTickets {
  purchaseTickets: boolean
  multiplier?: number
}

export class MonadexTrade extends Trade {
  hidePairAnalytics = false
  router: TradeRouter
  readonly path: readonly Token[]

  constructor (route: Route, amount: TokenAmount, tradeType: TradeType, router: TradeRouter, path: readonly Token[]) {
    super(route, amount, tradeType, ChainId.SEPOLIA)
    this.router = router
    this.path = path
  }

  static fromInnerTrade (innerTrade: Trade, router: TradeRouter, path: readonly Token[]): MonadexTrade {
    const amount = innerTrade.tradeType === TradeType.EXACT_INPUT
      ? innerTrade.inputAmount as TokenAmount
      : innerTrade.outputAmount as TokenAmount

    return new MonadexTrade(
      innerTrade.route,
      amount,
      innerTrade.tradeType,
      router,
      path
    )
  }

  static fromNormalTrade (trade: Trade): MonadexTrade {
    return MonadexTrade.fromInnerTrade(trade, defaultRouter, trade.route.path)
  }
}

export interface SwapPayload {
  path: string[]
  pairs: string[]
  extras: BytesLike[]
  inputAmount: BigNumberish
  minOutputAmount: BigNumberish
  expectedOutputAmount: BigNumberish
  to?: string
  deadline: BigNumberish
  partner: BigNumberish
  sig: BytesLike
  raffle: PurchaseTickets
}

export interface MinimaPayloadDetails {
  path: string[]
  pairs: string[]
  extras: BytesLike[]
  inputAmount: string
  expectedOutputAmount: string
  deadline: string
  partner: string
  sig: BytesLike
}

export interface MinimaTradePayload {
  expectedOut: string
  minimumExpectedOut?: string
  routerAddress: string
  priceImpact: {
    numerator: number
    denominator: number
  }
  details: MinimaPayloadDetails
  txn?: {
    data: string
    to: string
    gas: string
    from: string
  }
}

export class MinimaRouterTrade extends MonadexTrade {
  /**
   * The input amount for the trade assuming no slippage.
   */
  inputAmount: TokenAmount
  /**
   * The output amount for the trade assuming no slippage.
   */
  outputAmount: TokenAmount
  /**
   * The price expressed in terms of output amount/input amount.
   */
  executionPrice: Price
  /**
   * The mid price after the trade executes assuming no slippage.
   */
  nextMidPrice: Price
  /**
   * The percent difference between the mid price before the trade and the trade execution price.
   */
  priceImpact: Percent
  /**
   * Every field that is needed for executing a swap is contained within the details object
   */
  details: SwapPayload

  /*
   * Purchase ticket on every Trade execution
  */
  raffle: PurchaseTickets

  constructor (
    route: Route,
    inputAmount: TokenAmount,
    outputAmount: TokenAmount,
    router: TradeRouter,
    priceImpact: Percent,
    path: readonly Token[],
    details: SwapPayload,
    raffle: PurchaseTickets,
    public txn?: { data: string, to: string }
  ) {
    super(route, inputAmount, 0, router, path)
    this.router = router
    this.inputAmount = inputAmount
    this.outputAmount = outputAmount
    this.executionPrice = new Price(inputAmount.token, outputAmount.token, inputAmount.raw, outputAmount.raw)
    this.nextMidPrice = new Price(inputAmount.token, outputAmount.token, inputAmount.raw, outputAmount.raw)
    this.priceImpact = priceImpact
    this.hidePairAnalytics = true
    this.details = details
    this.raffle = raffle
  }

  static fromMinimaTradePayload (
    pairs: Pair[],
    inputAmount: TokenAmount,
    outputAmount: TokenAmount,
    routerAddress: string,
    priceImpact: Percent,
    path: readonly Token[],
    details: SwapPayload,
    raffle: PurchaseTickets
  ): MinimaRouterTrade {
    return new MinimaRouterTrade(
      new Route(pairs, inputAmount.currency),
      inputAmount,
      outputAmount,
      { routerAddress },
      priceImpact,
      path,
      details,
      raffle

    )
  }
}
