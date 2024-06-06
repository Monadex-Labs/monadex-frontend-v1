interface RowProps {
  classNames?: string
  children?: React.ReactNode
}

const Row: React.FC<any> = ({ children, classNames, ...rest }: RowProps) => {
  return (
    <div
      {...rest}
      className={`w-100 flex p-0 items-center content-start border rounded-md ${classNames ?? ''}`}

    >
      {children}
    </div>
  )
}

export const RowBetween: React.FC<any> = () => {
  return <Row classNames='justify-between' />
}

export const RowFixed: React.FC<any> = ({ gap }: { gap: string }) => {
  return <Row className={`w-fit m-[${gap}]`} />
}
