import { paginatedData } from "../shared/utils.shared";
import { CampaignLeaderBoardModel } from "./campaign-leaderboard.schema";
import { CampaignModel, CampaignStatus, ICampaign } from "./campaign.schema";
import { Types } from "mongoose"; // Import the 'Types' object from the 'mongoose' module


export const createCampaign = async (campaignData: ICampaign) => {
  const campaign = new CampaignModel(campaignData);
  campaign.slug = campaignData.title.toLowerCase().replace(/ /g, '_').replace(/^[a-zA-Z\_]$/, '');
  campaign.status = CampaignStatus.ACTIVE;
  return await campaign.save();
}

export const getCampaigns = async (page: number, limit: number, query = {}) => {
  return await paginatedData(CampaignModel, page, limit, query);
}

export const getCreatorCampaigns = async (username: string, page: number, limit: number, query = {}) => {
  query = { ...query, creator: username.toLocaleLowerCase() };
  return await paginatedData(CampaignModel, page, limit, query);
}

export const getCampaignLeaderBoard = async (campaignId: string, page: number, limit: number, query = {}) => {
  query = { ...query, campaign: new Types.ObjectId(campaignId) };
  return await paginatedData(CampaignLeaderBoardModel, page, limit, query);
}

