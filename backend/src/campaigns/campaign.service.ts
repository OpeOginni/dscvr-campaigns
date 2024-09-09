import { HTTPException } from "hono/http-exception";
import { generateFile, paginatedData } from "../shared/utils.shared";
import { CampaignLeaderBoardModel } from "./campaign-leaderboard.schema";
import {
  CampaignModel,
  CampaignStatus,
  DistributionType,
  type ICampaign,
} from "./campaign.schema";
import { Types } from "mongoose"; // Import the 'Types' object from the 'mongoose' module
import { mintSLPToken } from "../metaplex/SLP_Tokens";
import { createGenericFile, publicKey } from "@metaplex-foundation/umi";
import umi from "../metaplex/UMI";
import { mintNFTToken } from "../metaplex/NFT_Tokens";

export const createCampaign = async (campaignData: ICampaign) => {
  const campaign = new CampaignModel(campaignData);
  campaign.slug = campaignData.title
    .toLowerCase()
    .replace(/ /g, "_")
    .replace(/^[a-zA-Z\_]$/, "");
  campaign.status = CampaignStatus.ACTIVE;

  if (campaignData.image) {
    try {
      const { file, imageBuffer } = await generateFile(campaignData.image);

      const tokenImageFile = createGenericFile(
        new Uint8Array(imageBuffer),
        file.name,
        {
          tags: [{ name: "contentType", value: file.type }],
        }
      );

      const [imageUri] = await umi.uploader.upload([tokenImageFile]);
      campaign.imageURI = imageUri;
    } catch (err) {
      console.log(err);
      throw new HTTPException(500, {
        message: "Error with Uploading Image",
        cause: err,
      });
    }
  }

  return await campaign.save();
};

export const getCampaigns = async (page: number, limit: number, query = {}) => {
  return await paginatedData(CampaignModel, page, limit, query);
};

export const getCreatorCampaigns = async (
  walletAddress: string,
  page: number,
  limit: number,
  _query = {}
) => {
  const query = { ..._query, creator: walletAddress.toLocaleLowerCase() };
  return await paginatedData(CampaignModel, page, limit, query);
};

export const getCampaignLeaderBoard = async (
  campaignId: string,
  page: number,
  limit: number,
  _query = {}
) => {
  const query = { ..._query, campaign: new Types.ObjectId(campaignId) };
  return await paginatedData(CampaignLeaderBoardModel, page, limit, query);
};

export const getCampaignById = async (id: string) => {
  return await CampaignModel.findOne({ _id: id });
};

export const interactWithCampaign = async (
  campaignId: string,
  userId: string,
  userWalletAddress: string
) => {
  const campaign = await CampaignModel.findOne({ _id: campaignId });

  if (!campaign)
    throw new HTTPException(404, { message: "Campaign not found" });

  if (campaign.maxDistribution === campaign.numberOfTokensAlreadyDistributed)
    throw new HTTPException(400, { message: "Max Distribution Reached" });

  if (campaign.distribution === DistributionType.TOKEN) {
    const response = await mintSLPToken(
      campaign.imageURI,
      campaign.tokenName || "",
      campaign.tokenSymbol || "",
      publicKey(userWalletAddress),
      1
    );

    return response.signature;
  }
  if (campaign.distribution === DistributionType.NFT) {
    const response = await mintNFTToken(
      campaign.imageURI,
      campaign.tokenName || "",
      publicKey(userWalletAddress),
      1
    );

    return response.signatures[0];
  }
};
