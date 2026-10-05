import mongoose from 'mongoose';

const contactQuerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      default: 'General Inquiry',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied', 'archived'],
      default: 'unread',
    },
  },
  {
    timestamps: true,
  }
);

const ContactQuery = mongoose.models.ContactQuery || mongoose.model('ContactQuery', contactQuerySchema);

export default ContactQuery;
