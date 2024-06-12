import React from 'react'
import { escapeRegExp } from '@/utils'

// match escaped "." characters via in a non-capturing group
const inputRegex = RegExp('^\\d*(?:\\\\[.])?\\d*$') // eslint-disable-line 
export const Input = React.memo(function InnerInput ({
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
      className='styledInput'
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
      placeholder={placeholder || '0.0'} // eslint-disable-line
      minLength={1}
      maxLength={79}
      spellCheck='false'
    />
  )
})

export default Input
