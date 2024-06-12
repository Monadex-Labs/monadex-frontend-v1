/**
 * Retrieves the logo URLs for a given token address.
 *
 * @param {string} address - The token address.
 * @param {any} tokenList - Optional token list.
 * @return {any[]} An array of logo URLs.
 */
export const getTokenLogoURL = (address: string, tokenList?: any): any[] => {
  const logoExtensions = ['.png', '.webp', '.jpeg', '.jpg', '.svg']
  return logoExtensions
    .map((ext) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const image = require(`../assets/tokenLogo/${address.toLowerCase()}${ext}`)
        return image
      } catch (e) {
        return
      }
    })
    .concat([tokenList[address]?.tokenInfo?.logoURI])
    .filter((url) => !!url)
}
