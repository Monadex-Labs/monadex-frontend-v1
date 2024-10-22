import dbConnect from '@/discord/dbConnect'
import Xp from '@/discord/models'
import { NextRequest, NextResponse } from 'next/server'
import { calculateReward } from '@/utils/calculateMxpRewards'
import { SwapDelay } from '@/state/swap/actions'

export enum MethodType {
  SWAP,
  ADD_LIQUIDITY
}

export async function POST (req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Only POST requests allowed' }, { status: 405 })
  }

  await dbConnect()

  const { userId: id, methodType, swap }: { userId: string, methodType: MethodType, swap: SwapDelay } = await req.json()

  if (!id) return NextResponse.json({ message: 'User ID not provided' }, { status: 400 })

  try {
    const user = await Xp.findOne({ user: `<@${id}>` })
    if (!user) return NextResponse.json({ message: 'user not found' })

    const currentDate = new Date()
    const lastTransactionDate = new Date(user.lastTransactionTimestamp)
    console.log('lastTransactionDate', lastTransactionDate)

    // Reset counts if last transaction was more than 24 hours ago
    if (currentDate.getTime() - lastTransactionDate.getTime() > 24 * 60 * 60 * 1000) {
      user.swapCount = 0
      user.addLiqCount = 0
    }

    if (methodType === MethodType.SWAP && swap === SwapDelay.SWAP_COMPLETE) {
      user.swapCount++
      const rewardPoints = calculateReward(user.swapCount)
      console.log('rewardPoints', rewardPoints)
      user.points += rewardPoints
    } else if (methodType === MethodType.ADD_LIQUIDITY) {
      user.addLiqCount++

      const rewardPoints = calculateReward(user.addLiqCount)
      user.points += rewardPoints
    }

    user.lastTransactionTimestamp = currentDate

    await user.save()

    return NextResponse.json({
      message: 'Transaction processed successfully',
      updatedUser: user
    })
  } catch (error) {
    console.error('Error processing transaction:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
