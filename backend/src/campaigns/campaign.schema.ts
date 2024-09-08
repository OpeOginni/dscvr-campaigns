import mongoose, { Document, Schema } from 'mongoose';

export enum CampaignStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum DistributionType {
  NFT = 'NFT',
  TOKEN = 'TOKEN',
}
// Define the interface for the Campaign document
export interface ICampaign extends Document {
  id: string;
  title: string,
  slug?: string,
  startDate: Date;
  endDate: Date;
  creator: string,
  status: CampaignStatus,
  distribution: {
    type: string, // 'nft' | 'token'
    numberOrUserRewards: number, // 1 | 10 | -1
    numberOfIssuedRewards: number, // 0 | 10 | -1
  },
  createdAt?: Date,
  updatedAt?: Date,
}

// Define the Mongoose schema for the Campaign document
const CampaignSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  creator: {
    type: String,
    trim: true,
    required: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: CampaignStatus,
    default: true,
  },
  distribution: {
    type: {
      type: String,
      enum: DistributionType,
      required: true,
    },
    numberOrUserRewards: {
      type: Number,
      required: true,
    },
    numberOfIssuedRewards: {
      type: Number,
      default: 0,
      required: true,
    },
  },
}, { timestamps: true });

// Create and export the Campaign model
const CampaignModel = mongoose.model<ICampaign>('Campaigns', CampaignSchema);
CampaignSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export { CampaignModel };
