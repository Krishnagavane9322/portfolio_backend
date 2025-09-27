import mongoose, { Schema, Document, Model } from 'mongoose';

export interface MessageDocument extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const MessageSchema: Schema<MessageDocument> = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Message: Model<MessageDocument> =
  mongoose.models.Message || mongoose.model<MessageDocument>('Message', MessageSchema);
