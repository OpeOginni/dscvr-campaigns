import { CampaignModel, CampaignStatus, ICampaign } from "./campaign.schema";
import { Model } from "mongoose";


export const createCampaign = async (campaignData: ICampaign) => {
  const campaign = new CampaignModel(campaignData);
  campaign.slug = campaignData.title.toLowerCase().replace(/ /g, '_').replace(/^[a-zA-Z\_]$/, '');
  campaign.status = CampaignStatus.ACTIVE;
  return await campaign.save();
}
