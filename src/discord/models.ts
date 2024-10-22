import mongoose, { Document, Schema } from 'mongoose'

export interface IXp extends Document {
  Guild: string
  user: string
  points: number
  addLiqCount: number
  swapCount: number
  lastTransactionTimestamp: number | null
}

const xpSchema = new mongoose.Schema<IXp>({
  Guild: String,
  user: String,
  points: Number,
  addLiqCount: { type: Number, default: 0 },
  swapCount: { type: Number, default: 0 },
  lastTransactionTimestamp: { type: Number, default: null }
})

const Xp = mongoose.models?.xps || mongoose.model<IXp>('xps', xpSchema)
export default Xp