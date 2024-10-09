import React from 'react'
import { ApprovalState } from '@/hooks/useApproveCallback'

interface ApprouvalInterface {
  approvalA: ApprovalState
  approvalB: ApprovalState
  currencies: any
  error: string | undefined
  account: string | undefined
  isSupportedNetwork: boolean
  onAdd: () => void
  connect: () => any
  handleApproveA: () => Promise<void>

  handleApproveB: () => Promise<void>
  approvingA: boolean
  approvingB: boolean
}

const LiquidityButton = ({
  approvalA,
  approvalB,
  currencies,
  error,
  account,
  isSupportedNetwork,
  onAdd,
  connect,
  handleApproveA,
  handleApproveB,
  approvingA,
  approvingB
}: ApprouvalInterface): React.JSX.Element => {
  const Field = {
    CURRENCY_A: 'CURRENCY_A',
    CURRENCY_B: 'CURRENCY_B'
  }

  const getButtonText = () => {
    if (!account || !isSupportedNetwork) {
      return 'Connect Wallet'
    }
    if (error) {
      return error
    }
    if (approvalA !== ApprovalState.APPROVED) {
      return approvingA
        ? `Approving ${currencies[Field.CURRENCY_A]?.symbol ?? 'INVALID SYMBOL'}`
        : `Approve ${currencies[Field.CURRENCY_A]?.symbol ?? 'INVALID SYMBOL'}`
    }
    if (approvalB !== ApprovalState.APPROVED) {
      return approvingB
        ? `Approving ${currencies[Field.CURRENCY_B]?.symbol ?? 'INVALID SYMBOL'}`
        : `Approve ${currencies[Field.CURRENCY_B]?.symbol ?? 'INVALID SYMBOL'}`
    }
    return 'Add Liquidity'
  }

  const handleClick = async () => {
    if (!account || !isSupportedNetwork) {
      await connect()
    } else if (approvalA !== ApprovalState.APPROVED) {
      handleApproveA()
    } else if (approvalB !== ApprovalState.APPROVED) {
      handleApproveB()
    } else {
      onAdd()
    }
  }

  const isDisabled =
    (Boolean(account) &&
      isSupportedNetwork &&
      (Boolean(error) ||
        approvalA === ApprovalState.PENDING ||
        approvalB === ApprovalState.PENDING)) ||
    approvingA ||
    approvingB

  return (
    <button
      className='w-full bg-primary py-4 px-4 rounded-md disabled:opacity-40 bg-opacity-90 text-lg'
      disabled={isDisabled}
      onClick={handleClick}
    >
      {getButtonText()}
    </button>
  )
}

export default LiquidityButton
