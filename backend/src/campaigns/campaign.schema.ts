import mongoose, { Document, Schema } from "mongoose";
export enum CampaignStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum DistributionType {
  NFT = "NFT",
  TOKEN = "TOKEN",
}
// Define the interface for the Campaign document
export interface ICampaign extends Document {
  id: string;
  title: string;
  slug?: string;
  startDate: Date;
  endDate: Date;
  creator: string;
  status: CampaignStatus;
  image?: string;
  tokenName?: string;
  tokenSymbol?: string;
  distribution: string; // 'nft' | 'token'
  maxDistribution: number;
  requiredNumberOfDSCVRPoints: number;
  requiredDSCVRStreakDays: number;
  allowRecentAccounts: boolean;
  shouldFollowCreator: boolean;
  shouldReactToPost: boolean;
  shouldCommentOnPost: boolean;
  shouldBePortalMember: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the Mongoose schema for the Campaign document
const CampaignSchema: Schema = new Schema(
  {
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
    image: {
      type: String,
    },
    tokenName: {
      type: String,
    },
    tokenSymbol: {
      type: String,
    },
    distribution: {
      type: String,
      enum: DistributionType,
      required: true,
    },
    maxDistribution: {
      type: Number,
      required: true,
    },

    requiredNumberOfDSCVRPoints: {
      type: Number,
      required: true,
    },
    requiredDSCVRStreakDays: {
      type: Number,
      required: true,
    },
    allowRecentAccounts: {
      type: Boolean,
      required: true,
    },
    shouldFollowCreator: {
      type: Boolean,
      required: true,
    },
    shouldReactToPost: {
      type: Boolean,
      required: true,
    },
    shouldCommentOnPost: {
      type: Boolean,
      required: true,
    },
    shouldBePortalMember: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

// Create and export the Campaign model
const CampaignModel = mongoose.model<ICampaign>("Campaigns", CampaignSchema);
CampaignSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export { CampaignModel };
