
interface ButtonProps {
  classNames?: string
  children?: React.ReactNode
}

const Base: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={`p-8 w-100 font-semibold text-center rounded-sm outline-none 
      border text-white flex content-center items-center flex-nowrap cursor-pointer ${classNames ?? ''}`}

    >
      {children}
    </button>
  )
}

export const ButtonPrimary: React.FC<any> = ({ classNames, children, ...rest }: ButtonProps) => {
  return (
    <Base {...rest} classNames={`bg-indigo-500 hover:bg-indigo-600 text-white focus:shadow-md ${classNames ?? ''}`} />
  )
}
