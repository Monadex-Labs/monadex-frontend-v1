/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export default function isZero (hexNumberString: string): boolean {
  return /^0x0*$/.test(hexNumberString)
}
