import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    recipients: [
      {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      }
    ],
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
    },
    sender: {
      type: String,
      default: 'Dr. Vishwajeet Admin Desk',
    },
    recipientCount: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['sent', 'partial', 'failed'],
      default: 'sent',
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);

export default EmailLog;
