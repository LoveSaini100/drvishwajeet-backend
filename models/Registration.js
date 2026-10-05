import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
    },
    dob: {
      type: String,
      required: [true, 'Date of birth is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    occupation: {
      type: String,
      required: [true, 'Occupation is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'contacted', 'archived'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.virtual('birthMonthDay').get(function () {
  if (!this.dob) return null;
  const parts = this.dob.split('-');
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}`;
  }
  return null;
});

registrationSchema.set('toJSON', { virtuals: true });
registrationSchema.set('toObject', { virtuals: true });

const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

export default Registration;
