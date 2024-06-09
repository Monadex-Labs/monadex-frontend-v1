This is a [Monadex](https://monadex.exchange/) front-end 

## Getting Started

First, run the development server:

```bash
git clone https://github.com/Monadex-Labs/monadex-frontend-v1.git
npm install 
npm run dev


```

## Changelog
06/04 
added MonadexTrade | MinimaRouterTrade on swap.trade.ts file 
added ethers package + blocknative wallet 
setup web3-onboard config file
started integrating main hooks (useTradeCallback + use Swap Callback + useTrade) : Pending : reason : we need to work on state before starting hooks 
added button folder index.ts for buttons 
added folders application , burn , mint, raffle, swap, transaction , users 
added bg-img + color = first iteration we can improve it later
---
added actions, reducer, and currently pending on hooks for swap
added actions, reducer for user and working on hooks for user
added new constants on index.ts = constants folder
added tools + index on utils folder  

todo : finish wallet state folder hooks, then use this folder for swap hooks and user 

estimated time to finish everything clean: 1 week

# 07/04
- finished wallet state + multicall 
- imported Multicall abi from the standard abi = more info here https://github.com/makerdao/multicall/blob/master/src/Multicall.sol
- todo : the multicall contract need to be make by the smart contrats devs

- formatted every generic function in index.ts on outils
- created useContracts on hooks with use multicallContract + useRouterContract where we can create on contracts instanciations 
- create the store.ts == not finished yet, we need to finish all the states before 
- added new folder swap on components with some swap internal functions = used on the UI 
- added new constants to constant file 
# todo 
- finish swap hooks on the state and start the raffle state 
- before swap state I need to finish the user and token list state
- update useContracts but
estimated time : 1 day

# todo 06/06
- finish list hooks on state
- start user state
- Token.ts on hooks 
- Swap Hooks 

# 6/6
- finished Token.ts hook
- finished hook for user (managing swap secondary settings (pin/unpin pairs, import tokens, updateSlippage, changeDefaultSlippage))
- finished lists state
- swap hooks in progress! 

# 7/6 
- swap in progress...

# todo for 08/06 -> 10/06
- wrapppedCurrency file /utils  finished
- create Trade.ts Hook  in Progress = need to compile Pair contract for abi finished
- create useFindBestRoute hook for swap hooks  finished
- finish swap Hooks in Progress
- start transactions state

# 09/06
- working on swap hook
- start Transaction state
- finish useSwapCallback 
- start Raffle section state


# contracts deployed on base sepolia + verified
- Hash: 0x479f39b6e00564626a6bbd3e4ce11b03b012246cad6db597d40aadf1f752a733
Contract Address: 0x16104a43529389C139D92f3AC9EbB79Cff22694E  == V2 FACTORY CONTRACT


- Hash: 0x6e0a94f45c097f19c8d95fd83be57d878e1470717676bd0ccbfa03b72593172e
Contract Address: 0x8aA814fB63504711BC3619684c1d4dc449a9ea44  == MONADEX RAFFLE CONTRACT 



- Hash: 0xe0826871df4118f0b10500fec3b9b7d4f524e707b210346b853774fa500a2219
Contract Address: 0xD80b04Ed45b12F4871d9be252dB4db7F6785AbE8 == MONADEX V1 ROUTER 



- Hash: 0x5c840e53fd59f5b5d624e9d036d51b50c4d4cd9f57625c973d0a7a8a7691b6f7
Contract Address: 0x9AAFF974dE03b66c2Bd7077b87Da540978254c06   MDX TOKEN 


- Hash: 0xab564bafb4a8ac6e91b66a793d6b57d3d613f25dcacb74f8caef552dccf22b3e
Contract Address: 0xbcf86B64696B6e429D248526EfDaaC9aDcABe561   MONADEX V1 TIMELOCK



- Hash: 0xf9885ad417b1db5a180f4867359c135ea9701d2a68d3638ac978cef9bd4d7c05
Contract Address: 0xc995D06c9BFD62Bf7E9E50328Cd9B5584370041A   MONADEX V1 GOUVERNOR

