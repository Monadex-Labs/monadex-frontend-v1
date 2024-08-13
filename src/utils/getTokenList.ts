import { TokenList } from '@uniswap/token-lists'
import schema from '@uniswap/token-lists/src/tokenlist.schema.json'
import Ajv from 'ajv'
import axios from 'axios'
import uriToHttp from './toHttp'
const tokenListValidator = new Ajv({ allErrors: true }).compile(schema)
/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 * @param resolveENSContentHash resolves an ens name to a contenthash
 */
export default async function getTokenList (
  listUrl: string,
  skipValidation?: boolean
): Promise<TokenList> {
  let urls: string[]
  urls = uriToHttp(listUrl)
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isLast = i === urls.length - 1
    let response
    try {
      response = await axios.get('api/TokenList', {
        params: {
          tokenList: url
        }
      })
    } catch (error) {
      console.log('Failed to fetch list', listUrl, error)
      if (isLast) throw new Error(`Failed to download list ${listUrl}`)
      continue
    }

    if (!response.data) {
      if (isLast) throw new Error(`Failed to download list ${listUrl}`)
      continue
    }

    try {
      // The content of the result is sometimes invalid even with a 200 status code.
      // A response can be invalid if it's not a valid JSON or if it doesn't match the TokenList schema.
      const list = skipValidation ? response.data : tokenListValidator(response.data)

      if (!list) {
        const validationErrors: string =
            tokenListValidator.errors?.reduce<string>((memo, error) => {
              const add = `${error.dataPath} ${error.message ?? ''}`
              return memo.length > 0 ? `${memo}; ${add}` : `${add}`
            }, '') ?? 'unknown error'
        throw new Error(`Token list failed validation: ${validationErrors}`)
      }
      return list
    } catch (error) {
      console.debug(
          `failed to parse and validate list response: ${listUrl} (${url})`,
          error
      )
      continue
    }
  }
  throw new Error('Unrecognized list URL protocol.')
}
