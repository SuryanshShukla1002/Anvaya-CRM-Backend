import mongoose from 'mongoose';

// Lead Schema
const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
    },
    source: {
      type: String,
      required: [true, 'Lead source is required'],
      enum: ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'],
    },
    salesAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesAgent',
      required: [true, 'Sales Agent is required'],
    },
    status: {
      type: String,
      required: true,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'],
      default: 'New',
    },
    tags: {
      type: [String],
    },
    timeToClose: {
      type: Number,
      required: [true, 'Time to Close is required'],
      min: [1, 'Time to Close must be a positive number'],
    },
    priority: {
      type: String,
      required: true,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Clean up JSON output: replace `_id` with `id`
leadSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

// ✅ Update `updatedAt` on each save
leadSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
