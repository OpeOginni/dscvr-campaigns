import mongoose, { Document, Schema } from 'mongoose';
import { ICampaign } from './campaign.schema';

// Define the interface for the Campaign document
export interface ICampaignLeaderBoard extends Document {
  id?: string;
  campaign: string | ICampaign,
  username: string,
  createdAt?: Date,
  updatedAt?: Date,
}

// Define the Mongoose schema for the CampaignLeaderBoard document
const CampaignLeaderBoardSchema: Schema = new Schema({
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'Campaigns',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
}, { timestamps: true });


export const CampaignLeaderBoardModel = mongoose.model<ICampaignLeaderBoard>('CampaignLeaderBoard', CampaignLeaderBoardSchema);
CampaignLeaderBoardSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// export { CampaignLeaderBoardModel };
