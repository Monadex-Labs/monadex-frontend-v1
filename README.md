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