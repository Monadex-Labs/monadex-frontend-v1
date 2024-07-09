import mongoose, { Document, Schema } from 'mongoose'

export interface IXp extends Document {
  Guild: String
  user: String
  points: Number
}

const xpSchema = new mongoose.Schema<IXp>({
  Guild: String,
  user: String,
  points: Number
})

const Xp = mongoose.models.xps || mongoose.model<IXp>('xps', xpSchema)
export default Xp
