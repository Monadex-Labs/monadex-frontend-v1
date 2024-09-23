This is a [Monadex](https://monadex.exchange/) front-end 

## Getting Started

First, run the development server:

```bash
git clone https://github.com/Monadex-Labs/monadex-frontend-v1.git
npm install 
npm run dev


```

# Project Documentation

## Project Structure and Connections

### Folder Structure

The project follows a modular structure, divided into several key directories each serving a distinct purpose. Below is an outline of the key directories and their roles:

```
src/
  ├── components/
  │   ├── CurrencySelect/
  │   │   └── index.ts
  │   ├── CurrencyInput/
  │   │   ├── index.tsx
  │   │   └── CurrencyInput.tsx
  │   └── Swap/
  │       └── BestTradeAvancedSwapDetails.tsx
  ├── constants/
  ├── hooks/
  │   ├── useApprouveCallback.ts
  │   ├── useAutoSlippageTolerance.ts
  │   ├── Updaters.tsx
  ├── state/
  │   ├── application/
  │   │   ├── actions.ts
  │   │   ├── hooks.ts
  │   │   ├── reducer.ts
  │   │   └── updater.tsx
  │   ├── list/
  │   │   ├── actions.ts
  │   │   ├── hooks.ts
  │   │   ├── reducer.ts
  │   │   └── updater.tsx
  │   ├── mint/
  │   │   ├── actions.ts
  │   │   ├── hooks.ts
  │   │   ├── reducer.ts
  │   │   └── hook.ts
  │   ├── multicall/
  │   │   ├── hooks.ts
  │   │   ├── reducer.ts
  │   │   └── updater.tsx
  │   ├── swap/
  │   │   ├── actions.ts
  │   │   ├── hooks.ts
  │   │   ├── reducer.ts
  │   │   └── hook.ts
  │   ├── transactions/
  │   │   ├── actions.ts
  │   │   ├── hooks.ts
  │   │   └── reducer.ts
  │   └── wallet/
  │       └── hooks.ts
  └── utils/
      ├── getTokenList.ts
      └── index.ts
```

### Connection Between Folders

1. **Components**:
   - `CurrencySelect`, `CurrencyInput` and `Swap` contain presentational components used throughout the application. They interact with hooks and state management to update and display data.

2. **Hooks**:
   - `useAutoSlippageTolerance.ts`, `useApprouveCallback.ts`, and `Updaters.tsx` contain custom React hooks used to encapsulate reusable logic. Hooks interact heavily with the state management layer to read from and dispatch updates.

3. **State Management**:
   - The `state/` directory contains subdirectories pertaining to different slices of the whole application state. Each slice manages a piece of the global state, following the Redux style.
     - `application`, `list`, `mint`, `multicall`, `swap`, `transactions`, and `wallet` each manage specific parts of the application's state.
     - These slices use action creators (`actions.ts`), reducers (`reducer.ts`), hooks (`hooks.ts`), and updaters (`updater.tsx`) for their varying functionalities.

4. **Utils**:
   - Utility functions and constants that are used across the application. E.g., `getTokenList.ts`, `index.ts` contain helper functions and reusable logic not specific to any single component or slice of state.

### Updaters
- The `updaters.tsx` files serve to keep various parts of the application state synchronized with external data sources (like blockchain or APIs). They use hooks and dispatch actions to update Redux state based on changes detected through polling or event listeners. Examples include `ApplicationUpdater` and `ListUpdater`.

## Running the Code Locally

### Prerequisites
- Ensure Node.js and pnpm are installed on your machine.
- Optionally, you may want a package manager like yarn installed.

### Steps

1. **Clone Repository**:
   ```shell
   git clone <https://github.com/Monadex-Labs/monadex-frontend-v1.git>
   ```

2. **Install Dependencies**:
   Using npm:
   ```shell
   pnpm install

3. **Start Development Server**:
   Using npm:
   ```shell
   pnpm run dev
   ```


4. **Visit Local Development**:
   Open a browser and visit `http://localhost:3000` to see the application running locally.

## API for Hooks and State Folders

### `src/state/hooks`

#### Hooks

- **useApprouveCallback**:
  - Facilitates the approval of a given amount to a specified spender.
- **useCurrentBlockTimestamp**:
  - Returns the current block timestamp from the blockchain.
- **useFindBestRoute**:
  - Determines the best swap route based on various trading parameters.

#### Updaters

The `Updaters.tsx` file consolidates all updater components ensuring that different slices of the state are consistently synchronized:

```typescript
import ListUpdater from '@/state/list/updater'
import MulticallUpdater from '@/state/multicall/updater'
import ApplicationUpdater from '@/state/application/updater'

export default function Updaters (): JSX.Element {
  return (
      <>
        <ListUpdater />
        <MulticallUpdater />
        <ApplicationUpdater />
      </>
  )
}
```

### `src/state`

Key directories and their roles:

- **application**:
  - Contains actions, hooks, reducers, and updaters related to application state like modals, popup messages, and network-related data.
- **list**:
  - Manages token lists, handling updates and managing selected tokens.
- **mint**:
  - Handles minting functionalities.
- **multicall**:
  - Manages batched calls to the blockchain using the multicall contract.
- **swap**:
  - Manages swap functionalities including state and actions to swap cryptocurrencies.

## Purpose of `updaters.tsx`

The `updaters.tsx` file is essential for synchronizing various application slices with external data sources and ensuring consistency in the application state. Updaters listen to changes and dispatch actions to keep the Redux state updated.

---

This documentation aims to make it straightforward for developers to understand the folder structure, run the code locally, comprehend the connections between various parts of the application, and utilize key hooks and state management functionalities.
