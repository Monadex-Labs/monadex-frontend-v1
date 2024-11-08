import React from 'react'
import { escapeRegExp } from '@/utils'

const inputRegex = RegExp('^\\d*(?:\\\\[.])?\\d*$') // match escaped "." characters via in a non-capturing group

export const NumericalInput = React.memo(function InnerInput ({
  value,
  onUserInput,
  placeholder,
  fontSize,
  color,
  fontWeight,
  align,
  ...rest
}: {
  value: string | number
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: number
  fontWeight?: string | number
  align?: 'right' | 'left' | 'center'
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const enforcer = (nextUserInput: string): void => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  }

  return (
    <input
      {...rest}
      className='w-full relative outline-none border-none whitespace-nowrap text-ellipsis overflow-hidden text-left bg-transparent text-2xl'
      value={value}
      style={{ textAlign: align, color, fontSize, fontWeight }}
      onChange={(event) => {
        // replace commas with periods, because uniswap exclusively uses period as the decimal separator
        enforcer(event.target.value.replace(/,/g, '.'))
      }}
      // universal input options
      inputMode='decimal'
      autoComplete='off'
      autoCorrect='off'
      // text-specific options
      type='text'
      pattern='^[0-9]*[.,]?[0-9]*$'
      placeholder={placeholder || '0.0'}
      minLength={1}
      maxLength={79}
      spellCheck='false'
    />
  )
})

export default NumericalInput
