export const getIsInjected = () => Boolean(window.ethereum)

type NonMetaMaskFlag =
  // | 'isBraveWallet'
  | 'isTrustWallet'
  | 'isLedgerConnect'
  | 'isBlockWallet'
  | 'isCypherD'
  | 'isBitKeep'
  // | 'isPhantom'
  | 'isTrust'
const allNonMetamaskFlags: NonMetaMaskFlag[] = [
  // 'isBraveWallet',
  'isTrustWallet',
  'isLedgerConnect',
  'isBlockWallet',
  'isCypherD',
  'isBitKeep',
  // 'isPhantom',
  'isTrust'
]
export const getIsMetaMaskWallet = (): boolean => {
  const { ethereum } = window as any

  return Boolean(
    ethereum &&
      ethereum.isMetaMask &&
      (ethereum.detected && ethereum.detected.length > 0
        ? ethereum.detected.find(
          (provider: any) =>
            provider &&
              provider.isMetaMask &&
              !provider.detected &&
              !allNonMetamaskFlags.some((flag) => provider[flag])
        )
        : ethereum.providers && ethereum.providers.length > 0
          ? ethereum.providers.find(
            (provider: any) =>
              provider &&
              provider.isMetaMask &&
              !provider.providers &&
              !allNonMetamaskFlags.some((flag) => provider[flag])
          )
          : !allNonMetamaskFlags.some((flag) => ethereum[flag]))
  )
}
