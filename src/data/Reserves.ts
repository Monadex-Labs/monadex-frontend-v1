import { TokenAmount, Pair, Token } from '@monadex/sdk';
import { useEffect, useMemo, useState } from 'react';
import MonadexV2Pair from '@/constants/abi/JSON/MonadexV1Pair.json';
import { Interface } from '@ethersproject/abi';
import { useMultipleContractSingleData } from '@/state/multicall/hooks';
import { wrappedCurrency } from '@/utils/wrappedCurrency';
import { useWalletData } from '@/utils';
import { PairV1Monadex } from './pool';
import { useFactoryContract } from '@/hooks/useContracts';
import { Contract } from 'ethers';

const MPAIR_INTERFACE = new Interface(MonadexV2Pair);

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

type PairData = readonly [PairState, Pair | null];

export function usePairs(
  currencies: [Token | undefined, Token | undefined][]
): ReadonlyArray<PairData> {
  const { chainId } = useWalletData();
  const [addresses, setAddresses] = useState<(string | undefined)[]>([]);

  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        wrappedCurrency(currencyA, chainId),
        wrappedCurrency(currencyB, chainId),
      ]),
    [chainId, currencies]
  )

  const FactoryContract = useFactoryContract()
    const pairAddress = useMemo(() => {
      PairV1Monadex.getPoolAddress(tokens, FactoryContract as Contract)
        .then((fetchedAddresses) => {
          console.log('dd', fetchedAddresses)
          setAddresses(fetchedAddresses);
        })
        .catch((error) => {
          console.error('Error fetching pool addresses:', error)
        });
    }, [tokens]);
  

  const results = useMultipleContractSingleData(addresses, MPAIR_INTERFACE, 'getReserves')

  const pairData: ReadonlyArray<PairData> = useMemo(() => {
    return results.map((result, i): PairData => {
      const { result: reserves, loading } = result;
      const tokenA = tokens[i][0];
      const tokenB = tokens[i][1];

      if (loading) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null];
      if (!reserves) return [PairState.NOT_EXISTS, null];

      const { reserve0, reserve1 } = reserves;
      const [token0, token1] = tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA];

      return [
        PairState.EXISTS,
        new Pair(
          new TokenAmount(token0, reserve0.toString()),
          new TokenAmount(token1, reserve1.toString())
        ),
      ];
    });
  }, [results, tokens]);

  return pairData;
}

export function usePair(
  tokenA?: Token,
  tokenB?: Token
): readonly [PairState, Pair | null] {
  const pairs = usePairs([[tokenA, tokenB]]);
  // Ensure pairs always return a tuple even if the data is missing
  return pairs[0] || [PairState.INVALID, null];
}