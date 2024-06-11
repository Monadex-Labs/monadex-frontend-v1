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
- soso: added MonadexTrade | MinimaRouterTrade on swap.trade.ts file 
- soso: added ethers package + blocknative wallet 
- soso: setup web3-onboard config file
- soso: started integrating main hooks (useTradeCallback + use Swap Callback + useTrade) : Pending : reason : we need to work on state before starting hooks 
- soso: added button folder index.ts for buttons 
- soso: added folders application , burn , mint, raffle, swap, transaction , users 
- soso: added bg-img + color = first iteration we can improve it later
---
- soso: added actions, reducer, and currently pending on hooks for swap
- soso: added actions, reducer for user and working on hooks for user
- soso: added new constants on index.ts = constants folder
- soso: added tools + index on utils folder  

todo : finish wallet state folder hooks, then use this folder for swap hooks and user 

estimated time to finish everything clean: 1 week

# 07/04
- soso: finished wallet state + multicall 
- soso: imported Multicall abi from the standard abi = more info here https://github.com/makerdao/multicall/blob/master/src/Multicall.sol
- soso: todo : the multicall contract need to be make by the smart contrats devs

- soso: formatted every generic function in index.ts on outils
- soso: created useContracts on hooks with use multicallContract + useRouterContract where we can create on contracts instanciations 
- soso: create the store.ts == not finished yet, we need to finish all the states before 
- soso: added new folder swap on components with some swap internal functions = used on the UI 
- soso: added new constants to constant file 
# todo 
- soso: finish swap hooks on the state and start the raffle state 
- soso: before swap state I need to finish the user and token list state
- soso: update useContracts but
estimated time : 1 day

# todo 06/06
- soso: finish list hooks on state
- soso: start user state
- soso: Token.ts on hooks 
- soso: Swap Hooks 

# 06/06
- soso: finished Token.ts hook
- soso: finished hook for user (managing swap secondary settings (pin/unpin pairs, import tokens, updateSlippage, changeDefaultSlippage))
- soso: finished lists state
- soso: swap hooks in progress! 

# 07/06 
- soso: swap in progress...
- daniel: fixed AddLiquidity and move to separate file. Remove ConfirmAddModalBottom component from Ubeswap.

# todo for 08/06 -> 10/06
- soso: wrapppedCurrency file /utils
- soso: create Trade.ts Hook
- soso: create useFindBestRoute hook for swap hooks
- soso: finish swap Hooks
- soso: start transactions state

# 08/06
- daniel: Move AddLiquidity and CurrencyInput components. Refactor folders.
- daniel: Add Logo Component
- daniel: Add CurrencyLogo component.
- daniel: Add CurrencySelect component. Pending: add CurrencySearchModal component (lots of dependencies).
- soso: wrapppedCurrency file /utils  finished
- soso: create Trade.ts Hook  in Progress = need to compile Pair contract for abi finished
- soso: create useFindBestRoute hook for swap hooks  finished
- soso: finish swap Hooks in Progress
- soso: start transactions state

# 09/06
- soso: working on swap hook
- soso: start Transaction state
- soso: finish useSwapCallback 
- soso: start Raffle section state
- daniel: Refactor component imports
- daniel: Moved swap hooks to hook folder
- soso : Swap state hook 96% done

# todo 10/60
- finish swap hooks
- soso: start transaction state + burn + mint
- soso: do hooks asked by daniel
# 10/06
- soso :swap hook on state finished
- soso: transactions state hooks finished
- soso :useSwapCallback finished
- soso: burn /mint state for liquidy finished

# 11/06
- soso: do hooks for daniel
- added header + footer component folder
- soso : added UseAllowance hook
- soso: added useProvider for redux
- added header
- created UseApprouveCallback hook  = approuve a swap = before useSwapCallback
## phase 1
- stop progress and start testing the hooks :::::::::::::::::::::
- fix errors on the imported componets before!