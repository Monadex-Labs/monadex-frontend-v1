export const getTokenLogoURL = (address?: string, tokenList?: any) => {
  const logoExtensions = ['.png', '.webp', '.jpeg', '.jpg', '.svg']
  return logoExtensions
    .map((ext) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // TODO@ fix this later
        // const image = require(`../assets/tokenLogo/${address.toLowerCase()}${ext}`)
        const image = require('../static/assets/defaultToken.png')
        return image
      } catch (e) {

      }
    })
    // .concat([tokenList[address as string]?.tokenInfo?.logoURI])
    // .filter((url) => !!url)
}
