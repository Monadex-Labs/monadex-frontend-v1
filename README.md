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
estimated time : 1 day

