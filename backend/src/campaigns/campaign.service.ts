import { paginatedData } from "../shared/utils.shared";
import { CampaignModel, CampaignStatus, ICampaign } from "./campaign.schema";


export const createCampaign = async (campaignData: ICampaign) => {
  const campaign = new CampaignModel(campaignData);
  campaign.slug = campaignData.title.toLowerCase().replace(/ /g, '_').replace(/^[a-zA-Z\_]$/, '');
  campaign.status = CampaignStatus.ACTIVE;
  return await campaign.save();
}

export const getCampaigns = async (page: number, limit: number, query = {}) => {
  return await paginatedData(CampaignModel, page, limit, query);
}

