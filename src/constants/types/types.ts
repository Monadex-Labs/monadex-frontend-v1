export interface AddLiquidity {
  token0: string
  token1: string
  amount0: string
  amount1: string
  amount0Min: string
  amount1Min: string
  receiver: string
  deadline: string
}
export interface AddLiquidityNative {
  token: string
  amount: string
  amountMin: string
  receiver: string
  deadline: string
}
